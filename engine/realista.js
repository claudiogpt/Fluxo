/**
 * @module realista
 * Mecânicas exclusivas do modo REALISTA: macro viva, imposto de renda,
 * liquidez e custos. `regras.js` delega para cá quando `s.realista` existe —
 * os outros modos nunca passam por este arquivo.
 *
 * O estado do modo tem tamanho FIXO (uma posição por ativo do catálogo).
 * Nada aqui pode virar array que cresce com o número de ordens: o estado
 * inteiro passa por `structuredClone` a cada action do Redux.
 *
 * @typedef {import('./typedefs.jsdoc').GameState} GameState
 * @typedef {import('./typedefs.jsdoc').EstadoRealista} EstadoRealista
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./config.js'), require('./catalogo.js'));
  } else {
    root.Fluxo = root.Fluxo || {};
    root.Fluxo.realista = factory(root.Fluxo.config, root.Fluxo.catalogo);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (config, catalogo) {

  /**
   * Posição zerada. `mesEntrada` null = nunca teve aporte (não há carência a contar).
   *
   * Repare que NÃO existe `saldo` aqui: o saldo de todo ativo mora em
   * `s.ativos[key]`, como em qualquer modo — é o que `patrimonio`,
   * `rendaPassiva` e a UI já leem. A posição guarda só o que é a mais no
   * realista (custo de aquisição, idade dos aportes, valor na curva). Duas
   * cópias do mesmo saldo divergiriam no primeiro `cobrir`.
   */
  function posicaoZerada() {
    return { custo: 0, mesMedio: 0, mesEntrada: null, curva: 0 };
  }

  /** Taxa anual → taxa do mês equivalente (juros compostos, não divisão por 12). */
  function mensal(anual) {
    return Math.pow(1 + anual, 1 / 12) - 1;
  }

  /** Ruído padrão do engine: soma de dois uniformes centrada em zero. */
  function ruido(rng) {
    return rng() + rng() - 1;
  }

  /**
   * Monta o sub-estado do modo realista.
   *
   * @param {'alta'|'baixa'} [macroInicial] - Cenário macro escolhido no setup.
   * @returns {EstadoRealista} Fresh mode state.
   */
  function novoEstado(macroInicial) {
    const cfg = config.realista;
    const inicio = macroInicial === 'baixa' ? 'baixa' : 'alta';
    const selic = inicio === 'baixa' ? cfg.selicBaixa : cfg.selicAlta;
    const posicoes = {};
    for (const d of catalogo.defs) posicoes[d.key] = posicaoZerada();
    return {
      macroInicial: inicio,
      macro: {
        selic: selic,
        // O alvo é para onde o ciclo puxa a taxa — é o que faz a Selic não
        // ficar parada nem passear sem rumo. Começa no valor corrente e passa
        // a ser movido pelos eventos de COPOM.
        selicAlvo: selic,
        ipca: cfg.ipcaInicial,
        ipcaAlvo: cfg.ipcaInicial,
        dPre: 0,
        dReal: 0,
      },
      posicoes: posicoes,
      // Zerados no topo de cada fecharMes: base dos tetos de isenção mensal.
      vendasMes: { acoes: 0, fii: 0, cripto: 0 },
      mesCustos: { adm: 0, corretagem: 0, comeCotas: 0, ir: 0 },
      // Acumulado da partida inteira — é o número que ensina o peso dos custos.
      custosTotais: { adm: 0, corretagem: 0, comeCotas: 0, ir: 0 },
      mesRenda: 0,
      // Última venda tributada — a UI usa pra explicar o que foi retido.
      ultimaVenda: null,
      // Contadores de efeito temporário de evento (choque de inflação,
      // vacância no FII, suspensão da isenção). Nascem aqui para o shape do
      // que passa por structuredClone não mudar quando os eventos chegarem.
      choqueInflacao: 0,
      mesesVacancia: 0,
      mesesSemIsencao: 0,
    };
  }

  /**
   * Clone PROFUNDO do sub-estado.
   *
   * `fecharMes` clona os sub-estados com spread raso (`{...st.negocio}`), o que
   * basta para estados planos. Aqui não bastaria: `posicoes` ficaria
   * compartilhado com o argumento e o `fecharMes` passaria a mutar a entrada,
   * quebrando em silêncio o contrato do módulo. Por isso o clone é explícito.
   *
   * @param {EstadoRealista} r - Mode state to copy.
   * @returns {EstadoRealista} Deep copy.
   */
  function clonar(r) {
    const posicoes = {};
    for (const k in r.posicoes) posicoes[k] = { ...r.posicoes[k] };
    return {
      ...r,
      macro: { ...r.macro },
      posicoes: posicoes,
      vendasMes: { ...r.vendasMes },
      mesCustos: { ...r.mesCustos },
      custosTotais: { ...r.custosTotais },
      ultimaVenda: r.ultimaVenda ? { ...r.ultimaVenda } : null,
    };
  }

  // ---------- mercado ----------

  /** Os fatores comuns de risco. Papéis que compartilham fator caem JUNTOS —
   *  é o que transforma "correlação" de texto de tooltip em mecânica. */
  const FATORES = ['juros', 'bolsaBR', 'intl', 'cripto'];

  /** Prende um número entre dois limites. */
  function limitar(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  /**
   * Move a Selic e o IPCA do mês.
   *
   * A taxa não passeia sem rumo nem fica parada: ela caminha uma fração do
   * caminho até o ALVO (reversão à média) e leva um empurrão aleatório. Quem
   * mexe no alvo são os eventos de COPOM — é isso que faz um choque de juros
   * durar meses em vez de um turno.
   *
   * Grava `dPre` (variação da Selic) e `dReal` (variação do juro real), que
   * são as entradas da marcação a mercado dos títulos.
   *
   * Consome 4 draws: 2 no ruído da Selic, 2 no do IPCA.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {() => number} rng - Injected randomness.
   */
  function macroMes(s, rng) {
    const cfg = config.realista;
    const m = s.realista.macro;

    const selicAntes = m.selic;
    const ipcaAntes = m.ipca;
    m.selic = limitar(
      m.selic + (m.selicAlvo - m.selic) * cfg.reversao + cfg.volSelic * ruido(rng),
      cfg.selicMin, cfg.selicMax
    );
    // Durante um choque de preços a inflação não só sobe: ela fica mais
    // ERRÁTICA. Por isso a volatilidade dobra enquanto o choque dura.
    const volIpca = cfg.volIpca * (s.realista.choqueInflacao > 0 ? 2 : 1);
    m.ipca = limitar(
      m.ipca + (m.ipcaAlvo - m.ipca) * cfg.reversao + volIpca * ruido(rng),
      cfg.ipcaMin, cfg.ipcaMax
    );

    m.dPre = m.selic - selicAntes;
    // Juro real ≈ juro nominal − inflação. É o que precifica o IPCA+: se a
    // inflação sobe junto com a Selic, o título indexado nem sente.
    m.dReal = m.dPre - (m.ipca - ipcaAntes);
  }

  /**
   * Aplica o retorno do mês a todos os ativos do catálogo.
   *
   * Renda fixa não sorteia nada: rende pelo indexador (Selic corrente, IPCA ou
   * a taxa travada na compra) e sofre marcação a mercado conforme a duration.
   * Renda variável combina o fator comum da sua classe com um ruído próprio,
   * mais a sensibilidade a juros (`beta`).
   *
   * Consome 4 draws na macro + 2 por fator (8) + 2 por ativo de renda variável
   * (20) = 32.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {() => number} rng - Injected randomness.
   * @returns {number} Cash income (dividends/rent) generated this month.
   */
  function mercado(s, rng) {
    const r = s.realista;
    const m = r.macro;
    macroMes(s, rng);
    const fatores = {};
    for (const f of FATORES) fatores[f] = ruido(rng);

    let renda = 0;
    for (const d of catalogo.defs) {
      const p = r.posicoes[d.key];
      // `accrual` é o que o papel rende POR CONTRATO — é ele que move a curva.
      // `mtm` é a marcação a mercado, que só mexe no preço de hoje.
      let accrual;
      let mtm = 0;
      if (d.indexador === 'selic') {
        accrual = mensal(m.selic) * d.fatorIndex;
      } else if (d.indexador === 'ipca') {
        accrual = mensal(m.ipca) + d.taxaContratada / 12;
        mtm = -d.duration * m.dReal;
      } else if (d.indexador === 'pre') {
        accrual = d.taxaContratada / 12;
        // A lição inteira em uma linha: juro sobe, preço do título longo cai.
        // Quanto mais longo (duration), mais dói — e a perda só vira real se
        // você vender antes do vencimento.
        mtm = -d.duration * m.dPre;
      } else {
        // 60% do movimento é a classe inteira, 40% é o papel — dois ativos da
        // mesma categoria andam juntos sem serem clones um do outro.
        accrual = d.ret + d.vol * (0.6 * fatores[d.fator] + 0.4 * ruido(rng));
        // Juro alto machuca bolsa: desconta o fluxo futuro e ainda concorre
        // com a renda fixa. Small cap e FII de tijolo apanham mais (beta).
        mtm = d.beta * m.dPre;
      }
      const ret = accrual + mtm;
      s.ativos[d.key] *= (1 + ret);
      s.varMes[d.key] = ret;
      p.curva *= (1 + accrual);
      // Vacância: o galpão vazio não paga aluguel. "Renda garantida" não existe
      // — é a lição que o dividend yield sozinho nunca conta.
      const corte = (d.key === 'fii_tijolo' && r.mesesVacancia > 0) ? 0.6 : 1;
      renda += s.ativos[d.key] * d.div * corte;
    }
    r.mesRenda = renda;
    return renda;
  }

  // ---------- imposto de renda ----------

  /**
   * Alíquota da tabela regressiva da renda fixa.
   *
   * O prazo é medido do MÊS MÉDIO dos aportes, não do primeiro: quem foi
   * comprando aos poucos carrega uma idade média, e é ela que a Receita
   * enxergaria se cada aporte fosse um lote.
   *
   * @param {number} meses - Months since the position's weighted average entry.
   * @returns {number} Tax rate (0.225 … 0.15).
   */
  function aliquotaRF(meses) {
    for (const [ate, taxa] of config.realista.aliquotasRF) {
      if (meses < ate) return taxa;
    }
    return config.realista.aliquotasRF[config.realista.aliquotasRF.length - 1][1];
  }

  /**
   * Imposto devido ao vender `valor` de um papel.
   *
   * Regras que o jogo ensina, todas do mundo real:
   * - renda fixa: tabela regressiva, 22,5% caindo a 15% depois de 2 anos;
   * - ações: 15% do LUCRO, isento se as vendas do mês couberem no teto — e o
   *   teto é sobre o VALOR VENDIDO, não sobre o lucro (o erro clássico);
   * - FII: 20% e nenhuma isenção, por mais que o aluguel mensal seja isento;
   * - cripto: 15%, com teto de isenção próprio e bem maior;
   * - LCI/LCA: nada.
   *
   * Prejuízo não gera imposto — e, por simplificação assumida, também não gera
   * crédito a compensar: o jogo não tem declaração anual.
   *
   * @param {GameState} s - Current game state.
   * @param {Object} d - Catalog definition.
   * @param {number} valor - Gross amount being sold.
   * @param {number} lucro - Realized profit inside that amount.
   * @returns {{imposto: number, aliquota: number, isento: boolean}} Tax breakdown.
   */
  function impostoDeVenda(s, d, valor, lucro) {
    const cfg = config.realista;
    const r = s.realista;
    if (d.tributacao === 'isento' || lucro <= 0) return { imposto: 0, aliquota: 0, isento: true };

    if (d.tributacao === 'rf') {
      const p = r.posicoes[d.key];
      const taxa = aliquotaRF(s.mes - p.mesMedio);
      return { imposto: lucro * taxa, aliquota: taxa, isento: false };
    }

    if (d.tributacao === 'fii') {
      return { imposto: lucro * cfg.irFii, aliquota: cfg.irFii, isento: false };
    }

    // ações e cripto: teto MENSAL de vendas, e a venda atual conta pro teto
    const classe = d.tributacao === 'cripto' ? 'cripto' : 'acoes';
    const teto = d.tributacao === 'cripto' ? cfg.isencaoCripto : cfg.isencaoAcoes;
    const taxa = d.tributacao === 'cripto' ? cfg.irCripto : cfg.irAcoes;
    // ETF e BDR não têm a isenção das ações brasileiras — daí o campo `isencao`
    const vendidoNoMes = r.vendasMes[classe] + valor;
    if (d.isencao && r.mesesSemIsencao <= 0 && vendidoNoMes <= teto) {
      return { imposto: 0, aliquota: 0, isento: true };
    }
    return { imposto: lucro * taxa, aliquota: taxa, isento: false };
  }

  /**
   * Encerra a conta do mês: registra no log o que foi pago de imposto e zera
   * os contadores mensais (tetos de isenção e custos do mês).
   *
   * Roda ANTES do `s.mes += 1` do `fecharMes`, para o log sair com o mês em
   * que as vendas de fato aconteceram.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {(msg: string, cor: string) => void} avisar - Log callback.
   */
  function fecharContaDoMes(s, avisar) {
    const r = s.realista;
    const ir = r.mesCustos.ir;
    if (ir >= 1) {
      avisar('▣ IMPOSTO DE RENDA: −' + fmtBR(ir) + ' retidos nas vendas do mês. Lucro bruto não é lucro no bolso.', '#ffc24b');
    }
    r.vendasMes = { acoes: 0, fii: 0, cripto: 0 };
    r.mesCustos = { adm: 0, corretagem: 0, comeCotas: 0, ir: 0 };
    if (r.mesesSemIsencao > 0) r.mesesSemIsencao -= 1;
    if (r.mesesVacancia > 0) r.mesesVacancia -= 1;
    if (r.choqueInflacao > 0) r.choqueInflacao -= 1;
  }

  /** Formata reais sem depender do módulo formato (evita mais uma dependência UMD). */
  function fmtBR(v) {
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }

  // ---------- liquidez ----------

  /**
   * Diz se a posição está travada e por quê.
   *
   * Liquidez é a mecânica que transforma "quanto rende" em "quanto rende E
   * quando posso sair". A LCI paga menos que o CDB e ainda trava 3 meses — o
   * jogador tem que decidir se o líquido compensa o cadeado.
   *
   * @param {GameState} s - Current game state.
   * @param {Object} d - Catalog definition.
   * @returns {{travado: boolean, motivo: string}} Lock status.
   */
  function bloqueio(s, d) {
    const p = s.realista.posicoes[d.key];
    if (!d.carencia || p.mesEntrada === null) return { travado: false, motivo: '' };
    const falta = d.carencia - (s.mes - p.mesEntrada);
    if (falta <= 0) return { travado: false, motivo: '' };
    return {
      travado: true,
      motivo: 'em carência: libera em ' + falta + (falta === 1 ? ' mês' : ' meses'),
    };
  }

  /**
   * Vence os papéis com prazo: o principal volta pro caixa pelo valor NA CURVA.
   *
   * É o outro lado da marcação a mercado — quem segurou até o fim recebe o que
   * foi contratado, e a oscilação do meio do caminho não importou. O IR é
   * cobrado aqui também: vencimento é resgate.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {(msg: string, cor: string) => void} avisar - Log callback.
   */
  function vencimentos(s, avisar) {
    const r = s.realista;
    for (const d of catalogo.defs) {
      if (!d.venceEm) continue;
      const p = r.posicoes[d.key];
      if (p.mesEntrada === null || s.ativos[d.key] < 1) continue;
      if (s.mes - p.mesEntrada < d.venceEm) continue;

      // No vencimento o preço converge pra curva: some qualquer ágio/deságio.
      const bruto = p.curva;
      const lucro = bruto - p.custo;
      const ir = impostoDeVenda(s, d, bruto, lucro);
      s.caixa += bruto - ir.imposto;
      r.mesCustos.ir += ir.imposto;
      r.custosTotais.ir += ir.imposto;
      s.ativos[d.key] = 0;
      r.posicoes[d.key] = posicaoZerada();
      avisar('◆ ' + d.nome + ' VENCEU: +' + fmtBR(bruto - ir.imposto) + ' no caixa'
        + (ir.imposto >= 1 ? ' (já descontado o IR)' : '') + '. Quem segurou recebeu a taxa contratada.', '#22d47e');
    }
  }

  // ---------- custos ----------

  /**
   * Cobra os custos do mês: taxa de administração e, a cada semestre,
   * come-cotas.
   *
   * A taxa de administração sai do SALDO, não do caixa — é assim que ela é
   * invisível na vida real, e é por isso que o jogo precisa mostrá-la somada.
   *
   * O come-cotas antecipa 15% do lucro acumulado e sobe a base de custo, que é
   * exatamente o efeito real: você paga antes e não paga de novo na venda.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {(msg: string, cor: string) => void} avisar - Log callback.
   */
  function custosDoMes(s, avisar) {
    const cfg = config.realista;
    const r = s.realista;
    let adm = 0;
    let comeCotas = 0;

    for (const d of catalogo.defs) {
      const saldo = s.ativos[d.key];
      if (saldo < 1) continue;
      const p = r.posicoes[d.key];

      if (d.taxaAdm > 0) {
        const custo = saldo * (d.taxaAdm / 12);
        s.ativos[d.key] -= custo;
        p.curva -= custo;
        adm += custo;
      }

      if (d.comeCotas && s.mes > 0 && s.mes % cfg.comeCotasMeses === 0) {
        const lucro = s.ativos[d.key] - p.custo;
        if (lucro > 0) {
          const imposto = lucro * cfg.irComeCotas;
          s.ativos[d.key] -= imposto;
          p.curva -= imposto;
          // A base sobe pro que sobrou: o lucro já tributado não é cobrado de novo.
          p.custo = s.ativos[d.key];
          comeCotas += imposto;
        }
      }
    }

    r.mesCustos.adm += adm;
    r.custosTotais.adm += adm;
    r.mesCustos.comeCotas += comeCotas;
    r.custosTotais.comeCotas += comeCotas;
    if (comeCotas >= 1) {
      avisar('▣ COME-COTAS: −' + fmtBR(comeCotas) + ' antecipados de IR nos fundos. Semestral, sem você fazer nada.', '#ffc24b');
    }
  }

  // ---------- ordens ----------

  /**
   * Compra e venda no modo realista.
   *
   * Mesmo contrato do `regras.mover`: sinal define a direção, clampa ao caixa
   * ou ao saldo, ignora movimento abaixo de R$ 1 e devolve PARCIAL pra merge
   * ({} = no-op). O extra é manter o custo médio e a idade dos aportes, que é
   * o que o imposto vai ler depois.
   *
   * @param {GameState} s - Current game state (not mutated).
   * @param {string} key - Catalog asset key.
   * @param {number} valor - Signed amount in BRL (positive = buy).
   * @returns {Partial<GameState>} Fields to merge, or `{}` if noop.
   */
  function mover(s, key, valor) {
    const d = catalogo.def(key);
    if (!d) return {};
    const r = clonar(s.realista);
    const p = r.posicoes[key];
    const a = { ...s.ativos };
    let v = valor;

    if (v > 0) {
      // A corretagem sai do caixa junto com a ordem, então ela limita o quanto
      // dá pra comprar: quem manda "tudo" não pode ficar devendo a taxa.
      const taxaFixa = d.corretagem || 0;
      v = Math.min(v, s.caixa - taxaFixa);
      if (v < 1) return {};
      const custoOrdem = taxaFixa + v * (d.spread || 0);
      // Custo médio: o que entra puxa a idade média da posição pra cima do mês
      // atual, proporcionalmente ao tamanho do aporte.
      const custoAnt = p.custo;
      p.mesMedio = custoAnt + v > 0 ? (p.mesMedio * custoAnt + s.mes * v) / (custoAnt + v) : s.mes;
      p.custo = custoAnt + v;
      // O mesEntrada só é (re)marcado quando a posição estava vazia: comprar
      // mais não reinicia a carência do que já estava lá.
      if (p.mesEntrada === null) p.mesEntrada = s.mes;
      a[key] += v;
      // Comprar HOJE é comprar pelo preço de hoje: o dinheiro novo entra na
      // curva pelo mesmo valor, sem herdar o ágio ou o deságio do que já havia.
      p.curva += v;
      r.mesCustos.corretagem += custoOrdem;
      r.custosTotais.corretagem += custoOrdem;
      return { ativos: a, caixa: s.caixa - v - custoOrdem, realista: r };
    }

    // Carência: o engine se recusa a vender o que está travado. A UI desabilita
    // o botão antes (`bloqueio`), mas a regra mora aqui.
    if (bloqueio(s, d).travado) return {};

    v = Math.min(-v, a[key]);
    if (v < 1) return {};
    const custoSaida = (d.corretagem || 0) + v * (d.spread || 0);
    // Resgate proporcional: sai a mesma fatia do custo e da curva. `mesMedio`
    // NÃO muda — o que sai tem a mesma idade média do que fica.
    const fracao = v / a[key];
    const custoSaido = p.custo * fracao;
    const lucro = v - custoSaido;
    const ir = impostoDeVenda(s, d, v, lucro);

    p.custo = p.custo - custoSaido;
    p.curva = p.curva * (1 - fracao);
    a[key] -= v;
    if (a[key] < 1) { p.mesEntrada = null; p.custo = 0; p.mesMedio = 0; p.curva = 0; }

    // A venda entra no contador do mês mesmo quando isenta: é ela que pode
    // empurrar a PRÓXIMA venda pra fora do teto.
    if (r.vendasMes[classeDe(d)] !== undefined) r.vendasMes[classeDe(d)] += v;
    r.mesCustos.ir += ir.imposto;
    r.custosTotais.ir += ir.imposto;
    r.mesCustos.corretagem += custoSaida;
    r.custosTotais.corretagem += custoSaida;
    r.ultimaVenda = {
      key: key, bruto: v, lucro: lucro, imposto: ir.imposto,
      aliquota: ir.aliquota, isento: ir.isento, mes: s.mes,
    };

    // O que cai no caixa é o LÍQUIDO. É a diferença entre o que a tela promete
    // e o que o banco credita — a lição inteira do IR em uma linha.
    return { ativos: a, caixa: s.caixa + v - ir.imposto - custoSaida, realista: r };
  }

  /** Classe do teto mensal de isenção a que este papel pertence. */
  function classeDe(d) {
    return d.tributacao === 'cripto' ? 'cripto' : d.tributacao === 'fii' ? 'fii' : 'acoes';
  }

  /**
   * Liquidação forçada no realista.
   *
   * Mesmo papel do `regras.cobrir`, mas a ordem e o deságio vêm do catálogo
   * (`ordemLiquidacao` + `desagio` de cada papel) em vez de `config.liquidacao`,
   * que só conhece as 5 chaves dos modos antigos. Sem isto o jogador ficaria
   * "FALIDO" com a carteira cheia: o cobrir antigo não acharia nenhuma chave.
   *
   * Muta `s.ativos` e as posições in place, como o original.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {number} deficit - Shortfall in BRL to cover.
   * @param {(msg: string, cor: string) => void} avisar - Log callback.
   * @returns {number} Remaining uncovered amount (> 0 = still broke).
   */
  function cobrir(s, deficit, avisar) {
    const r = s.realista;
    for (const key of catalogo.ordemLiquidacao) {
      if (deficit <= 0) break;
      if (s.ativos[key] < 1) continue;
      const d = catalogo.def(key);
      // Nem a urgência quebra a carência: papel travado não vira dinheiro. É
      // por isso que uma reserva LÍQUIDA não é a mesma coisa que patrimônio.
      if (bloqueio(s, d).travado) continue;
      const bruto = Math.min(s.ativos[key], deficit / d.desagio);
      const liquido = bruto * d.desagio;
      const fracao = bruto / s.ativos[key];
      const p = r.posicoes[key];
      p.custo = p.custo * (1 - fracao);
      p.curva = p.curva * (1 - fracao);
      s.ativos[key] -= bruto;
      if (s.ativos[key] < 1) { p.mesEntrada = null; p.custo = 0; p.mesMedio = 0; p.curva = 0; }
      deficit -= liquido;
      const perda = Math.round((1 - d.desagio) * 100);
      avisar('⚠ ' + d.nome + ' liquidado às pressas' + (perda > 0 ? ' com ' + perda + '% de perda' : ' — sem perdas') + '.',
        perda > 5 ? '#ff9d4b' : '#ffc24b');
    }
    return deficit;
  }

  return { novoEstado, clonar, posicaoZerada, macroMes, mercado, mover, cobrir, mensal, aliquotaRF, impostoDeVenda, fecharContaDoMes, bloqueio, vencimentos, custosDoMes };
});
