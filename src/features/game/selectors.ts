// View-model do jogo: porta o renderVals() do orquestrador DC pra selectors.
// Só formatação/derivação — dados prontos pros componentes; callbacks ficam
// nos componentes (dispatch). Cores e textos copiados 1:1 do original.
import { createSelector } from '@reduxjs/toolkit';
import { ativos as ativosDef, config, formato, regras } from '../../engine';
import type { GameState } from '../../engine/types';
import { corDoEngine } from './cores';

type ComGame = { game: GameState };

export const selectGame = (s: ComGame) => s.game;

const { fmt, fmtTempo, sparkline } = formato;

// ---- cards de ativos ----

export const selectAtivosLista = createSelector([selectGame], (s) =>
  ativosDef.map((d) => {
    const v = s.ativos[d.key];
    const r = s.varMes[d.key] || 0;
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
  })
);

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

// ---- menu (Intro) ----

export const selectIntroConfig = createSelector([selectGame], (s) => {
  const normalSel = s.dificuldade === 'normal';
  const ap = s.aposentadoria;
  const im = s.imoveis;
  const cfgI = config.imoveis;
  const comprando = im?.escolha === 'comprar';
  const saqueFixo = ap?.saqueModo === 'fixo';

  return {
    modosLista: config.modos.map((m) => {
      const selecionado = m.id === s.modo;
      return {
        id: m.id,
        nome: m.nome,
        descricao: m.descricao,
        disponivel: m.disponivel,
        tag: m.disponivel ? (selecionado ? '▸ SELECIONADO' : '') : 'EM BREVE',
        tagCor: m.disponivel ? 'var(--sucesso)' : 'var(--texto-apagado)',
        borda: selecionado ? 'var(--sucesso)' : 'var(--borda)',
        nomeCor: m.disponivel ? 'var(--texto-forte)' : 'var(--texto-apagado)',
        descCor: m.disponivel ? 'var(--texto-fraco)' : 'var(--texto-apagado)',
        cursor: m.disponivel ? ('pointer' as const) : ('default' as const),
      };
    }),
    cenariosLista: config.cenarios.map((c) => {
      const selecionado = c.id === s.cenario;
      return {
        id: c.id,
        nome: c.nome,
        descricao: c.descricao,
        disponivel: c.disponivel,
        tag: c.disponivel ? (selecionado ? '▸ SELECIONADO' : '') : 'EM BREVE',
        tagCor: c.disponivel ? 'var(--sucesso)' : 'var(--texto-apagado)',
        borda: selecionado ? 'var(--sucesso)' : 'var(--borda)',
        nomeCor: c.disponivel ? 'var(--texto-forte)' : 'var(--texto-apagado)',
        descCor: c.disponivel ? 'var(--texto-fraco)' : 'var(--texto-apagado)',
        cursor: c.disponivel ? ('pointer' as const) : ('default' as const),
      };
    }),
    capitaisLista: config.sandbox.capitais.map((v) => ({
      valor: v,
      rotulo: fmt(v),
      bg: s.capitalInicial === v ? 'var(--tint-sucesso)' : 'transparent',
      cor: s.capitalInicial === v ? 'var(--sucesso)' : 'var(--texto-rotulo)',
    })),
    mostraCapitais: s.modo === 'sandbox',
    mostraCenarios: s.modo === 'cenarios',
    mostraSaqueConfig: !!ap,
    mostraEstrategia: !!im,
    normalBg: normalSel ? 'var(--tint-sucesso)' : 'transparent',
    normalCor: normalSel ? 'var(--sucesso)' : 'var(--texto-rotulo)',
    hardBg: normalSel ? 'transparent' : 'var(--tint-perigo)',
    hardCor: normalSel ? 'var(--texto-rotulo)' : 'var(--perigo)',
    difDica: normalSel
      ? 'mais folga no caixa e menos acidentes — bom pra aprender as mecânicas'
      : 'caixa inicial menor, custo de vida mais pesado e mais acidentes no caminho',
    fixoBg: saqueFixo ? 'var(--tint-sucesso)' : 'transparent',
    fixoCor: saqueFixo ? 'var(--sucesso)' : 'var(--texto-rotulo)',
    pctBg: !saqueFixo ? 'var(--tint-sucesso)' : 'transparent',
    pctCor: !saqueFixo ? 'var(--sucesso)' : 'var(--texto-rotulo)',
    saqueDica: saqueFixo
      ? 'saque fixo = seu custo de vida (inflaciona). É o que cria o risco de sequência.'
      : 'saque de ' + (ap ? (ap.taxaSaque * 100).toFixed(0) : '4') + '% do patrimônio/mês — se ajusta sozinho e quase nunca zera.',
    comprarBg: comprando ? 'var(--tint-info)' : 'transparent',
    comprarCor: comprando ? 'var(--info)' : 'var(--texto-rotulo)',
    alugarBg: im && !comprando ? 'var(--tint-info)' : 'transparent',
    alugarCor: im && !comprando ? 'var(--info)' : 'var(--texto-rotulo)',
    estrategiaDica: im
      ? comprando
        ? 'entrada ' + fmt(Math.round(cfgI.valorImovel * cfgI.entradaPct)) + ' + ' + im.prazo + ' parcelas de ' + fmt(im.parcela) + ' — o imóvel é seu e valoriza'
        : 'aluguel ' + fmt(im.aluguel) + '/mês — sobra mais no bolso; disciplina decide se rende mais que o tijolo'
      : '',
    caixaFmt: fmt(s.caixa),
    custoFmt: fmt(s.custo),
    salarioFmt: fmt(s.salario),
    rendaResumo: ap
      ? 'acumula ' + ap.turnosAcumulacao + ' meses, depois saca por ' + ap.turnosSaque + ' meses'
      : im
        ? comprando
          ? 'parcela ' + fmt(im.parcela) + '/mês por ' + im.prazo + ' meses'
          : 'aluguel ' + fmt(im.aluguel) + '/mês · diferença sobra pra investir'
        : s.negocio
          ? 'negócio: giro ' + fmt(s.negocio.caixa) + ' · receita ~' + fmt(s.negocio.receitaBase) + ' − custos ' + fmt(s.negocio.custoFixo) + '/mês'
          : 'salário ' + fmt(s.salario) + '/mês',
  };
});

const selectLog = (s: ComGame) => s.game.log;

/** O log guarda a cor que o engine gravou — traduz pra token antes da tela. */
export const selectLogLinhas = createSelector([selectLog], (log) =>
  log.map((l) => ({ ...l, cor: corDoEngine(l.cor) }))
);

export const selectTela = (s: ComGame) => s.game.tela;
export const selectFimAtivo = (s: ComGame) => !!s.game.fim;
