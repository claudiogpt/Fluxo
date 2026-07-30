// View-model do jogo: porta o renderVals() do orquestrador DC pra selectors.
// Só formatação/derivação — dados prontos pros componentes; callbacks ficam
// nos componentes (dispatch). Cores e textos copiados 1:1 do original.
import { createSelector } from '@reduxjs/toolkit';
import { ativos as ativosDef, catalogo, config, formato, realista as realista_, regras } from '../../engine';
import type { CatalogoDef, EstadoRealista, GameState } from '../../engine/types';
import { corDoEngine } from './cores';

type ComGame = { game: GameState };

export const selectGame = (s: ComGame) => s.game;

// Entradas ESTREITAS pros selectors do realista: `selectGame` inteiro muda a
// cada tick de 500ms (por causa de `s.agora`), e com 15 ativos + agregação por
// categoria isso recomputaria duas vezes por segundo à toa.
const selectAtivosMapa = (s: ComGame) => s.game.ativos;
const selectVarMes = (s: ComGame) => s.game.varMes;
const selectRealista = (s: ComGame) => s.game.realista;

const { fmt, fmtTempo, sparkline } = formato;

// ---- cards de ativos ----

/** View-model de um card de ativo — igual pros 5 clássicos e pros 15 do catálogo. */
export interface LinhaAtivo {
  key: string;
  nome: string;
  ticker: string;
  dica: string;
  riscoLabel: string;
  riscoCor: string;
  valorFmt: string;
  varFmt: string;
  varCor: string;
  /** Só no realista, e só quando a marcação a mercado abriu diferença: o que
   *  o papel vale HOJE contra o que vale se você segurar até o vencimento. */
  curvaNota?: string;
  curvaCor?: string;
  /** Só no realista: quanto o leão morde se você vender AGORA. Vem antes da
   *  venda de propósito — depois não é mais decisão, é constatação. */
  irNota?: string;
  irCor?: string;
  /** Só no realista: papel em carência não pode ser vendido. */
  bloqueio?: { travado: boolean; motivo: string };
}

/** Uma linha de card, montada a partir da definição + saldo + variação. */
function linhaDe(d: CatalogoDef | (typeof ativosDef)[number], v: number, r: number): LinhaAtivo {
  return {
    key: d.key,
    nome: d.nome,
    ticker: d.ticker,
    dica: d.dica,
    riscoLabel: d.risco,
    riscoCor: corDoEngine(d.riscoCor),
    valorFmt: fmt(v),
    varFmt: v < 1 ? '—' : (r >= 0 ? '▲ +' : '▼ ') + (r * 100).toFixed(1) + '% no mês',
    varCor: v < 1 ? 'var(--texto-apagado)' : r >= 0 ? 'var(--sucesso)' : 'var(--perigo)',
  };
}

/** Lista plana dos 5 ativos clássicos. Vazia no realista: lá a carteira é
 *  navegada por categoria (selectCategoriasLista + selectAtivosPorCategoria). */
export const selectAtivosLista = createSelector([selectGame], (s) =>
  s.realista ? [] : ativosDef.map((d) => linhaDe(d, s.ativos[d.key], s.varMes[d.key] || 0))
);

// ---- carteira do realista (drill-down por categoria) ----

export const selectCategoriasLista = createSelector(
  [selectRealista, selectAtivosMapa, selectVarMes],
  (realista, ativos, varMes) => {
    if (!realista) return null;
    return catalogo.categorias.map((c) => {
      const defs = catalogo.daCategoria(c.id);
      const total = defs.reduce((t, d) => t + ativos[d.key], 0);
      const renda = defs.reduce((t, d) => t + ativos[d.key] * d.div, 0);
      // Variação da categoria = média PONDERADA pelo saldo. Sem posição, a
      // categoria não tem variação própria pra mostrar — mostra o traço.
      const varPond = total > 0
        ? defs.reduce((t, d) => t + (varMes[d.key] || 0) * ativos[d.key], 0) / total
        : 0;
      const comPosicao = defs.filter((d) => ativos[d.key] >= 1).length;
      return {
        id: c.id,
        nome: c.nome,
        dica: c.dica,
        totalFmt: fmt(total),
        temPosicao: total >= 1,
        rendaFmt: renda >= 1 ? '+' + fmt(renda) + ' / mês' : 'sem renda em caixa',
        varFmt: total < 1 ? '—' : (varPond >= 0 ? '▲ +' : '▼ ') + (varPond * 100).toFixed(1) + '%',
        varCor: total < 1 ? 'var(--texto-apagado)' : varPond >= 0 ? 'var(--sucesso)' : 'var(--perigo)',
        resumo: comPosicao > 0 ? `${comPosicao} de ${defs.length} com posição` : `${defs.length} ativos`,
      };
    });
  }
);

const selectMes = (s: ComGame) => s.game.mes;

/** O que o leão morde se a venda for AGORA — a decisão precisa dessa conta
 *  antes, não depois. Mostra também quando a alíquota vai cair, que é o que
 *  transforma "esperar" numa estratégia visível. */
function notaDeIR(d: CatalogoDef, lucro: number, mesesNaMao: number, r: EstadoRealista): string {
  if (d.tributacao === 'isento') return 'isento de IR';
  if (lucro <= 0) return 'sem lucro a tributar';

  if (d.tributacao === 'rf') {
    const faixas = config.realista.aliquotasRF;
    const atual = faixas.find(([ate]) => mesesNaMao < ate) ?? faixas[faixas.length - 1];
    const proxima = faixas.find(([ate]) => ate > (atual[0] ?? 0));
    const cai = proxima && atual[0] < 9999
      ? ` · cai pra ${(proxima[1] * 100).toFixed(1).replace('.', ',')}% em ${Math.ceil(atual[0] - mesesNaMao)} ${Math.ceil(atual[0] - mesesNaMao) === 1 ? 'mês' : 'meses'}`
      : '';
    return `IR ${(atual[1] * 100).toFixed(1).replace('.', ',')}% sobre ${fmt(lucro)} de lucro${cai}`;
  }

  if (d.tributacao === 'fii') return `IR 20% sobre ${fmt(lucro)} de lucro (FII não tem isenção na venda)`;

  const cripto = d.tributacao === 'cripto';
  const teto = cripto ? config.realista.isencaoCripto : config.realista.isencaoAcoes;
  const jaVendido = r.vendasMes[cripto ? 'cripto' : 'acoes'];
  const taxa = cripto ? config.realista.irCripto : config.realista.irAcoes;
  if (!d.isencao) return `IR ${taxa * 100}% sobre ${fmt(lucro)} — sem a isenção das ações BR`;
  const folga = teto - jaVendido;
  return folga > 0
    ? `isento até ${fmt(folga)} vendidos neste mês · depois IR ${taxa * 100}%`
    : `IR ${taxa * 100}% sobre ${fmt(lucro)} — o teto do mês já foi usado`;
}

/** Um Record pronto em vez de um selector com argumento: memoizar por
 *  parâmetro exigiria uma fábrica por categoria, e trocar de subtela
 *  invalidaria o cache a cada clique. */
export const selectAtivosPorCategoria = createSelector(
  [selectRealista, selectAtivosMapa, selectVarMes, selectMes],
  (realista, ativos, varMes, mes) => {
    const mapa: Record<string, LinhaAtivo[]> = {};
    if (!realista) return mapa;
    for (const c of catalogo.categorias) {
      mapa[c.id] = catalogo.daCategoria(c.id).map((d) => {
        const saldo = ativos[d.key];
        const linha = linhaDe(d, saldo, varMes[d.key] || 0);
        const pos = realista.posicoes[d.key];
        const lucro = saldo - pos.custo;
        if (saldo >= 1) {
          linha.irNota = notaDeIR(d, lucro, mes - pos.mesMedio, realista);
          linha.irCor = lucro > 0 && linha.irNota?.startsWith('IR') ? 'var(--aviso)' : 'var(--texto-rotulo)';
        }
        linha.bloqueio = realista_.bloqueio({ realista, mes }, d);
        // A marcação a mercado só é uma lição se o jogador VÊ as duas contas:
        // o preço de hoje e o valor no vencimento.
        const curva = realista.posicoes[d.key].curva;
        const dif = curva - saldo;
        if (d.duration > 0 && saldo >= 1 && Math.abs(dif) >= 1) {
          // `fmt` do valor ABSOLUTO: o sinal já está dito em palavras, e
          // "paga R$ -123 a mais" é o tipo de frase que ninguém lê duas vezes.
          const modulo = fmt(Math.abs(dif));
          linha.curvaNota = dif > 0
            ? `na curva: ${fmt(curva)} — vender hoje custa ${modulo} de prejuízo`
            : `na curva: ${fmt(curva)} — o mercado paga ${modulo} a mais hoje`;
          linha.curvaCor = dif > 0 ? 'var(--aviso)' : 'var(--sucesso)';
        }
        return linha;
      });
    }
    return mapa;
  }
);

// ---- custos da partida ----

export const selectCustosMes = createSelector([selectRealista], (r) => {
  if (!r) return null;
  const mes = r.mesCustos.adm + r.mesCustos.corretagem + r.mesCustos.comeCotas + r.mesCustos.ir;
  const total = r.custosTotais.adm + r.custosTotais.corretagem + r.custosTotais.comeCotas + r.custosTotais.ir;
  if (total < 1) return null;
  const parte = (rotulo: string, v: number) => (v >= 1 ? `${rotulo} ${fmt(v)}` : null);
  return {
    mesFmt: fmt(mes),
    totalFmt: fmt(total),
    linhas: [
      parte('taxa adm', r.custosTotais.adm),
      parte('corretagem', r.custosTotais.corretagem),
      parte('come-cotas', r.custosTotais.comeCotas),
      parte('IR', r.custosTotais.ir),
    ].filter(Boolean).join(' · '),
  };
});

// ---- macro (Selic e IPCA) ----

export const selectMacro = createSelector([selectRealista], (r) => {
  if (!r) return null;
  const m = r.macro;
  const pct = (v: number) => (v * 100).toFixed(2).replace('.', ',') + '%';
  // Juro real é razão, não subtração: (1+nominal)/(1+inflação) − 1.
  const real = (1 + m.selic) / (1 + m.ipca) - 1;
  // A tendência é a distância até o ALVO, não o passo do último mês: é o alvo
  // que diz pra onde o juro caminha nos próximos meses. Dizer "COPOM sinaliza
  // alta" quando foi só o ruído mensal seria mentir pro jogador.
  const sobe = m.selicAlvo > m.selic + 0.002;
  const cai = m.selicAlvo < m.selic - 0.002;
  return {
    selicFmt: pct(m.selic),
    alvoFmt: pct(m.selicAlvo),
    ipcaFmt: pct(m.ipca),
    realFmt: pct(real),
    realCor: real > 0 ? 'var(--sucesso)' : 'var(--perigo)',
    setaSelic: m.dPre > 0.0001 ? '▲' : m.dPre < -0.0001 ? '▼' : '=',
    selicCor: m.dPre > 0.0001 ? 'var(--alerta)' : m.dPre < -0.0001 ? 'var(--sucesso)' : 'var(--texto-fraco)',
    ciclo: sobe
      ? `Juro abaixo do alvo (${pct(m.selicAlvo)}): a tendência é subir — prefixado longo e bolsa sofrem, pós-fixado comemora.`
      : cai
        ? `Juro acima do alvo (${pct(m.selicAlvo)}): a tendência é cair — prefixado longo se valoriza, pós-fixado rende menos.`
        : 'Juro ancorado no alvo. O ciclo só vira quando o COPOM mexer.',
  };
});

// ---- painel de status ----

export const selectPainel = createSelector([selectGame], (s) => {
  const rp = regras.rendaPassiva(s);
  const pat = regras.patrimonio(s);
  const prog = Math.min(100, (rp / s.custo) * 100);
  const ap = s.aposentadoria;
  const im = s.imoveis;
  const emSaque = !!(ap && ap.fase === 'saque');
  const comprando = im?.escolha === 'comprar';
  const modoDef = config.modos.find((m) => m.id === s.modo);

  let progLabel: string, progVal: number, salarioLabel: string, salarioStatus: string, salarioCor: string, modoTag: string;
  if (ap) {
    if (emSaque) {
      progLabel = 'SOBREVIVÊNCIA — meses de saque aguentados';
      progVal = Math.min(100, (ap.saquesFeitos / ap.turnosSaque) * 100);
      salarioLabel = 'SAQUE / MÊS';
      salarioStatus = '−' + fmt(ap.saqueMes);
      salarioCor = 'var(--alerta)';
      modoTag = 'SAQUE ' + ap.saquesFeitos + '/' + ap.turnosSaque;
    } else {
      progLabel = 'ACUMULAÇÃO — meses até aposentar';
      progVal = Math.min(100, (s.mes / ap.turnosAcumulacao) * 100);
      salarioLabel = 'SALÁRIO / MÊS';
      salarioStatus = '+' + fmt(s.salario);
      salarioCor = 'var(--sucesso-suave)';
      modoTag = 'ACUMULAÇÃO ' + s.mes + '/' + ap.turnosAcumulacao;
    }
  } else if (im) {
    progLabel = 'CENÁRIO IMÓVEIS — meses do financiamento';
    progVal = Math.min(100, (s.mes / im.prazo) * 100);
    salarioLabel = 'SALÁRIO / MÊS';
    salarioStatus = s.semSalario > 0 ? 'DESEMPREGADO' : '+' + fmt(s.salario);
    salarioCor = s.semSalario > 0 ? 'var(--perigo)' : 'var(--sucesso-suave)';
    modoTag = comprando ? 'IMÓVEIS · COMPRANDO' : 'IMÓVEIS · ALUGANDO';
  } else {
    progLabel = 'RUMO À INDEPENDÊNCIA — renda passiva vs. custo de vida';
    progVal = prog;
    salarioLabel = s.negocio ? 'LUCRO MÉDIO DO NEGÓCIO' : 'SALÁRIO / MÊS';
    salarioStatus = s.negocio
      ? s.negocio.falido
        ? 'SEM RENDA'
        : '+' + fmt(s.negocio.receitaBase - s.negocio.custoFixo)
      : s.semSalario > 0
        ? 'DESEMPREGADO'
        : '+' + fmt(s.salario);
    salarioCor = s.negocio
      ? s.negocio.falido
        ? 'var(--perigo)'
        : 'var(--sucesso-suave)'
      : s.semSalario > 0
        ? 'var(--perigo)'
        : 'var(--sucesso-suave)';
    modoTag = s.modo === 'classico' ? '' : modoDef ? modoDef.nome : s.modo.toUpperCase();
  }
  const progCor = progVal >= 100 ? 'var(--sucesso)' : progVal >= 50 ? 'var(--sucesso-suave)' : progVal >= 20 ? 'var(--aviso)' : 'var(--alerta)';
  const spark = sparkline(s.hist.length ? s.hist : [pat]);

  return {
    mesFmt: String(s.mes).padStart(2, '0'),
    tempoFmt: s.inicioTs ? fmtTempo((s.fimTs ?? s.agora ?? Date.now()) - s.inicioTs) : '00:00',
    tempoCor: s.auto ? 'var(--aviso)' : 'var(--texto-forte)',
    sparkPoints: spark.points,
    sparkCor: spark.positivo ? 'var(--sucesso)' : 'var(--perigo)',
    patrimonioFmt: fmt(pat),
    caixaFmt: fmt(s.caixa),
    caixaCor: s.caixa < s.custo ? 'var(--perigo)' : 'var(--texto-forte)',
    salarioLabel,
    salarioStatus,
    salarioCor,
    custoFmt: fmt(s.custo),
    rpFmt: fmt(rp),
    progPct: progVal.toFixed(1),
    progFmt: progVal.toFixed(1) + '%',
    progCor,
    progLabel,
    modoTag,
    autoLabel: s.auto ? '⏸ AUTO: ON' : '▶ AUTO: OFF',
    autoBg: s.auto ? 'var(--tint-aviso)' : 'transparent',
    autoCor: s.auto ? 'var(--aviso)' : 'var(--texto-rotulo)',
    ehSandbox: s.modo === 'sandbox',
  };
});

// ---- fim de jogo (5 desfechos) ----

export const selectFimInfo = createSelector([selectGame], (s) => {
  if (!s.fim) return null;
  const rp = regras.rendaPassiva(s);
  const pat = regras.patrimonio(s);
  const ap = s.aposentadoria;
  const im = s.imoveis;
  const comprando = im?.escolha === 'comprar';

  if (s.fim === 'apos_sucesso') {
    return {
      titulo: 'APOSENTADORIA OK', cor: 'var(--sucesso)',
      resumo: 'Seu patrimônio sustentou todos os ' + (ap ? ap.turnosSaque : '') + ' meses de saque sem zerar.',
      licao: 'Lição: acumular o suficiente e diversificar amortece o "risco de sequência de retornos" — uma sequência de anos ruins logo no início da aposentadoria é o que mais quebra quem para de trabalhar.',
    };
  }
  if (s.fim === 'apos_faliu') {
    return {
      titulo: 'ACABOU', cor: 'var(--perigo)',
      resumo: 'Seu patrimônio durou ' + (ap ? ap.saquesFeitos : 0) + ' de ' + (ap ? ap.turnosSaque : '') + ' meses de saque antes de zerar.',
      licao: 'Lição: mesma média de retorno, ordem diferente = resultado diferente. Anos ruins no começo forçam vender na baixa e derrubam tudo. Sacar menos e ter reserva protege os primeiros anos — é o risco de sequência de retornos.',
    };
  }
  if (s.fim === 'imoveis_fim' && im) {
    const tijolo = im.valorImovel; // quitado ao fim do prazo
    const carteira = im.carteiraAluguel;
    const tijoloVenceu = tijolo >= carteira;
    return {
      titulo: tijoloVenceu ? 'TIJOLO VENCEU' : 'ALUGUEL VENCEU',
      cor: tijoloVenceu === comprando ? 'var(--sucesso)' : 'var(--aviso)',
      resumo: '🏠 COMPRAR: imóvel quitado valendo ' + fmt(tijolo) + '  ·  📈 ALUGAR+INVESTIR: carteira em ' + fmt(carteira) + '. Você escolheu ' + (comprando ? 'COMPRAR' : 'ALUGAR') + ' e fechou com patrimônio total de ' + fmt(pat) + '.',
      licao: 'Lição: custo de oportunidade — cada real na entrada e nas parcelas é um real que não compôs juros na carteira (e vice-versa). Não há resposta universal: juros do financiamento, valorização do imóvel e disciplina de investir a diferença decidem a corrida.',
    };
  }
  if (s.fim === 'faliu') {
    return {
      titulo: 'FALIU', cor: 'var(--perigo)',
      resumo: 'Você sobreviveu ' + s.mes + ' meses antes de as contas engolirem tudo.',
      licao: 'Lição: reserva de emergência primeiro, sempre. Concentração + azar = falência. Diversificar não é sobre ganhar mais, é sobre nunca quebrar.',
    };
  }
  return {
    titulo: 'LIVRE', cor: 'var(--sucesso)',
    resumo: 'Em ' + s.mes + ' meses sua renda passiva (' + fmt(rp) + ') superou seu custo de vida (' + fmt(s.custo) + ').',
    licao: 'Lição: quem venceu não acertou o timing do mercado — construiu renda passiva mês a mês e deixou os juros compostos trabalharem.',
  };
});

// ---- cards de modo (empresário / imóveis) ----

export const selectNegocioCard = createSelector([selectGame], (s) => {
  const n = s.negocio;
  if (!n) return null;
  const cfgE = config.empresario;
  const vermelho = n.caixa < 0;
  return {
    falido: n.falido,
    operando: !n.falido,
    statusLabel: n.falido ? 'FALIDO' : vermelho ? 'VERMELHO ' + n.mesesNoVermelho + '/' + cfgE.mesesFalencia : 'OPERANDO',
    statusCor: n.falido ? 'var(--perigo)' : vermelho ? 'var(--alerta)' : 'var(--sucesso)',
    caixaFmt: fmt(n.caixa),
    caixaCor: vermelho ? 'var(--perigo)' : 'var(--texto-forte)',
    receitaFmt: n.receitaMes == null ? '—' : '+' + fmt(n.receitaMes) + ' no mês',
    receitaCor: n.receitaMes == null ? 'var(--texto-apagado)' : n.varReceitaMes >= 0 ? 'var(--sucesso)' : 'var(--alerta)',
    receitaBaseFmt: fmt(n.receitaBase),
    custoFixoFmt: fmt(n.custoFixo),
    dica: 'A empresa tem caixa próprio: reinvestir cresce a receita (com retorno decrescente), sacar leva o lucro pro seu bolso. Não deixe o giro secar.',
    reinvestirLabel: 'REINVESTIR ' + fmt(cfgE.reinvestimentoPasso) + ' ▸ +' + fmt(regras.ganhoReinvestimento(n.nivel)) + '/MÊS',
    caixaNegocio: n.caixa,
  };
});

export const selectImovelCard = createSelector([selectGame], (s) => {
  const im = s.imoveis;
  if (!im) return null;
  const comprando = im.escolha === 'comprar';
  const equityTijolo = im.valorImovel - regras.saldoDevedor(im);
  const tijoloLidera = equityTijolo >= im.carteiraAluguel;
  return {
    escolhaLabel: comprando ? 'COMPRANDO ' + im.pagas + '/' + im.prazo : 'ALUGANDO',
    mensalFmt: comprando
      ? im.pagas < im.prazo ? '−' + fmt(im.parcela) + '/mês · parcela' : 'QUITADO ✓'
      : '−' + fmt(im.aluguel) + '/mês · aluguel',
    dica: comprando
      ? 'Seu dinheiro vira tijolo: o imóvel valoriza, mas a parcela aperta o caixa. A corrida abaixo compara com quem alugou e investiu a diferença em FIIs.'
      : 'Você paga aluguel e a diferença sobra no SEU caixa — invista com disciplina. A corrida abaixo assume que cada real da diferença foi pra FIIs.',
    varImovelFmt: (im.varImovelMes >= 0 ? '▲ +' : '▼ ') + (im.varImovelMes * 100).toFixed(1) + '% no mês',
    varImovelCor: im.varImovelMes >= 0 ? 'var(--sucesso)' : 'var(--perigo)',
    tijoloTag: 'TIJOLO' + (comprando ? ' (VOCÊ)' : ' (FANTASMA)'),
    tijoloFmt: fmt(equityTijolo),
    tijoloCor: tijoloLidera ? 'var(--sucesso)' : 'var(--texto-fraco)',
    carteiraTag: 'ALUGAR+INVESTIR' + (comprando ? ' (FANTASMA)' : ' (SUA META)'),
    carteiraFmt: fmt(im.carteiraAluguel),
    carteiraCor: !tijoloLidera ? 'var(--sucesso)' : 'var(--texto-fraco)',
  };
});

const selectLog = (s: ComGame) => s.game.log;

/** O log guarda a cor que o engine gravou — traduz pra token antes da tela. */
export const selectLogLinhas = createSelector([selectLog], (log) =>
  log.map((l) => ({ ...l, cor: corDoEngine(l.cor) }))
);

export const selectTela = (s: ComGame) => s.game.tela;
export const selectFimAtivo = (s: ComGame) => !!s.game.fim;
