/**
 * @file Eventos aleatórios do jogo: tabela de pesos + sorteio por turno.
 * Cada evento muta a cópia de trabalho `s` e registra no log.
 * `s.pendente` acumula gastos debitados no fim do turno.
 * @typedef {import('./typedefs.jsdoc').GameState} GameState
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./config.js'), require('./formato.js'), require('./catalogo.js'), require('./realista.js'));
  } else {
    root.Fluxo = root.Fluxo || {};
    root.Fluxo.eventos = factory(root.Fluxo.config, root.Fluxo.formato, root.Fluxo.catalogo, root.Fluxo.realista);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (config, formato, catalogo, realistaApi) {

  const fmt = formato.fmt;

  /** Taxa anual em texto curto, pros logs de COPOM. */
  function pct(v) {
    return (v * 100).toFixed(2).replace('.', ',') + '%';
  }

  // Classe conceitual → categoria do catálogo realista.
  const CATEGORIA = { acoes: 'acoes', fiis: 'fii', cripto: 'cripto', intl: 'intl' };

  /**
   * Aplica um choque de preço a uma CLASSE de ativo.
   *
   * Nos modos antigos a classe é a própria chave (`s.ativos.acoes`). No
   * realista ela vira várias: um crash da bolsa derruba blue chips, small caps
   * E ações de dividendos. Sem esta tradução o evento multiplicaria uma chave
   * inexistente por 0.7 — `undefined * 0.7` é NaN, e o NaN contamina o
   * patrimônio inteiro na primeira soma.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {'acoes'|'fiis'|'cripto'} classe - Conceptual asset class.
   * @param {number} fator - Price multiplier (0.7 = −30%).
   */
  function choque(s, classe, fator) {
    const chaves = s.realista
      ? catalogo.daCategoria(CATEGORIA[classe]).map(function (d) { return d.key; })
      : [classe];
    for (const k of chaves) {
      if (typeof s.ativos[k] !== 'number') continue;
      s.ativos[k] *= fator;
      // A curva do realista acompanha o choque: quem levou o tombo foi o
      // ativo, não a marcação — não há preço "na curva" a recuperar aqui.
      if (s.realista && s.realista.posicoes[k]) s.realista.posicoes[k].curva *= fator;
    }
  }

  /**
   * Sorteia e aplica um evento aleatório no turno atual.
   *
   * Respeita `config.mesMinimoEvento`, chance por dificuldade e filtros
   * `modos` / `soComNegocio`. Eventos sem `modos` valem para todos.
   *
   * @param {GameState} s - Working copy of game state (mutated in place).
   * @param {LogItem[]} logs - Log array for event messages.
   * @param {Object} ctx - Context injected by `fecharMes`.
   * @param {() => number} ctx.rng - Injectable RNG.
   * @param {Function} ctx.addLog - Log helper from regras.
   */
  function sortear(s, logs, ctx) {
    const rng = ctx.rng || Math.random;
    const addLog = ctx.addLog;
    const dif = config.dificuldades[s.hard ? 'hardcore' : 'normal'];
    if (rng() > dif.chanceEvento || s.mes < config.mesMinimoEvento) return;
    const eventos = [
      { p: 16, run: () => { choque(s, 'acoes', 0.7); choque(s, 'fiis', 0.88); addLog(s, logs, '▼ CRASH DA BOLSA. Ações −30%, FIIs −12%. Quem vende no pânico realiza o prejuízo.', '#ff4d5e', s.mes); } },
      { p: 12, run: () => { choque(s, 'cripto', 0.55); addLog(s, logs, '▼ INVERNO CRIPTO. −45% num mês. Era o dinheiro do aluguel?', '#ff4d5e', s.mes); } },
      { p: 10, run: () => { choque(s, 'cripto', 1.6); addLog(s, logs, '▲ BULL RUN CRIPTO. +60%. Cuidado: euforia não é estratégia.', '#22d47e', s.mes); } },
      { p: 16, run: () => { const c = Math.round(s.custo * (0.8 + rng() * 1.4) * Math.min(1, s.mes / 12)); s.pendente = (s.pendente || 0) + c; addLog(s, logs, '✚ EMERGÊNCIA MÉDICA: −' + fmt(c) + '. É pra isso que existe reserva.', '#ff9d4b', s.mes); } },
      { p: 12, run: () => { const c = Math.round(s.custo * (0.35 + rng() * 0.55) * Math.min(1, s.mes / 12)); s.pendente = (s.pendente || 0) + c; addLog(s, logs, '✚ IMPREVISTO (carro/casa): −' + fmt(c) + '.', '#ff9d4b', s.mes); } },
      { p: 12, run: () => { s.custo = Math.round(s.custo * 1.04); addLog(s, logs, '▲ INFLAÇÃO ALTA. Custo de vida +4%. Seu dinheiro parado vale menos.', '#ffc24b', s.mes); } },
      { p: 8, modos: ['classico', 'sandbox', 'realista'], run: () => { s.semSalario = s.mes < 18 ? 1 : 2; addLog(s, logs, '✖ DEMISSÃO. ' + (s.mes < 18 ? '1 mês' : '2 meses') + ' sem salário. Renda passiva e reserva seguram as pontas?', '#ff4d5e', s.mes); } },
      { p: 8, modos: ['classico', 'sandbox', 'realista'], run: () => { s.salario = Math.round(s.salario * 1.08); addLog(s, logs, '▲ PROMOÇÃO. Salário +8%. Aumentar aporte > aumentar padrão de vida.', '#22d47e', s.mes); } },
      { p: 6, modos: ['classico', 'sandbox', 'realista'], run: () => { s.caixa += s.salario; addLog(s, logs, '▲ 13º / BÔNUS: +' + fmt(s.salario) + ' no caixa. Investe ou torra?', '#22d47e', s.mes); } },
      { p: 5, run: () => { const g = Math.round(s.custo * (3 + rng() * 4)); s.caixa += g; addLog(s, logs, '▲ GRANA INESPERADA (herança/restituição): +' + fmt(g) + '. Torrar ou acelerar a liberdade?', '#22d47e', s.mes); } },

      // ---- exclusivos do modo realista ----
      // O COPOM move o ALVO, não a taxa: o juro caminha até lá ao longo de
      // vários meses (reversão à média em realista.macroMes). É o que faz um
      // ciclo de aperto durar uma temporada em vez de um turno.
      { p: 14, modos: ['realista'], run: () => { const m = s.realista.macro; m.selicAlvo = Math.min(config.realista.selicMax, m.selicAlvo + 0.02 + rng() * 0.02); addLog(s, logs, '▲ COPOM APERTA. Meta da Selic sobe pra ' + pct(m.selicAlvo) + '. Prefixado longo e bolsa sofrem; pós-fixado agradece.', '#ff9d4b', s.mes); } },
      { p: 12, modos: ['realista'], run: () => {
        const m = s.realista.macro;
        // Banco central não corta juro com inflação descontrolada: se o juro
        // REAL está espremido, o corte não acontece. É a regra de reação do
        // mundo real — e a lição de que juro e inflação andam amarrados.
        const juroReal = (1 + m.selic) / (1 + m.ipca) - 1;
        if (juroReal < config.realista.juroRealMinimoPraCortar) {
          addLog(s, logs, '▣ COPOM MANTÉM A META. Com a inflação em ' + pct(m.ipca) + ', não há espaço pra cortar juro — o real já está em ' + pct(juroReal) + '.', '#ffc24b', s.mes);
          return;
        }
        m.selicAlvo = Math.max(config.realista.selicMin, m.selicAlvo - 0.02 - rng() * 0.02);
        addLog(s, logs, '▼ COPOM CORTA. Meta da Selic cai pra ' + pct(m.selicAlvo) + '. Prefixado longo dispara; sua reserva rende menos.', '#22d47e', s.mes); } },
      { p: 10, modos: ['realista'], run: () => { const m = s.realista.macro; m.ipcaAlvo = Math.min(config.realista.ipcaMax, m.ipcaAlvo + 0.03 + rng() * 0.03); s.realista.choqueInflacao = 6; addLog(s, logs, '▲ CHOQUE DE INFLAÇÃO. IPCA projetado em ' + pct(m.ipcaAlvo) + '. Quem está em IPCA+ está protegido; quem está em prefixado, não.', '#ff9d4b', s.mes); } },
      { p: 10, modos: ['realista'], run: () => { choque(s, 'intl', 1.12); choque(s, 'acoes', 0.94); addLog(s, logs, '▲ CRISE CAMBIAL. Dólar dispara: internacional +12%, bolsa BR −6%. Diversificar país é defesa, não modinha.', '#ffc24b', s.mes); } },
      { p: 8, modos: ['realista'], run: () => { s.realista.mesesVacancia = 4; addLog(s, logs, '▼ VACÂNCIA NO FII DE TIJOLO. O aluguel cai 40% por 4 meses. "Renda garantida" não existe.', '#ff9d4b', s.mes); } },
      { p: 6, modos: ['realista'], run: () => { s.realista.mesesSemIsencao = 12; addLog(s, logs, '▣ MUDANÇA NA REGRA DO IR. A isenção mensal de ações fica suspensa por 12 meses. Risco regulatório também é risco.', '#ffc24b', s.mes); } },
      { p: 5, modos: ['realista'], run: () => {
        const perdido = s.ativos.rf_cdb || 0;
        if (perdido < 1) { s.caixa += Math.round(s.custo * 0.5); addLog(s, logs, '▲ RESTITUIÇÃO DO IR: +' + fmt(Math.round(s.custo * 0.5)) + '.', '#22d47e', s.mes); return; }
        // O FGC cobre até R$ 250 mil por instituição — acima disso o risco é seu.
        const coberto = Math.min(perdido, 250000);
        s.ativos.rf_cdb = 0;
        s.realista.posicoes.rf_cdb = realistaApi.posicaoZerada();
        s.caixa += coberto;
        addLog(s, logs, '✖ O BANCO DO SEU CDB QUEBROU. FGC devolveu ' + fmt(coberto) + (perdido > coberto ? ' — os outros ' + fmt(perdido - coberto) + ' acima do teto viraram pó.' : ' (dentro do teto).') + ' Risco de crédito existe.', '#ff4d5e', s.mes); } },
      { p: 12, modos: ['empresario'], soComNegocio: true, run: () => { const c = Math.round(s.negocio.receitaBase * 0.4); s.negocio.caixa -= c; addLog(s, logs, '✚ CLIENTE INADIMPLENTE: −' + fmt(c) + ' no caixa da empresa. Faturar não é receber.', '#ff9d4b', s.mes); } },
      { p: 10, modos: ['empresario'], soComNegocio: true, run: () => { s.negocio.custoFixo = Math.round(s.negocio.custoFixo * 1.06); addLog(s, logs, '▲ FORNECEDORES REAJUSTARAM. Custo fixo da empresa +6%. Margem é disciplina.', '#ffc24b', s.mes); } },
      { p: 10, modos: ['empresario'], soComNegocio: true, run: () => { const g = Math.round(s.negocio.receitaBase * 0.8); s.negocio.caixa += g; addLog(s, logs, '▲ CONTRATO FECHADO: +' + fmt(g) + ' no caixa da empresa. Reinveste ou realiza?', '#22d47e', s.mes); } },
      { p: 8, modos: ['empresario'], soComNegocio: true, run: () => { const c = Math.round(s.negocio.custoFixo * 0.5); s.negocio.caixa -= c; addLog(s, logs, '✚ EQUIPAMENTO QUEBROU: −' + fmt(c) + ' do caixa da empresa. Imprevisto também tem CNPJ.', '#ff9d4b', s.mes); } },
    ];
    const modo = s.modo || 'classico';
    const disponiveis = eventos.filter(e => {
      if (e.modos && !e.modos.includes(modo)) return false;
      if (e.soComNegocio && (!s.negocio || s.negocio.falido)) return false;
      return true;
    });
    const total = disponiveis.reduce((t, e) => t + e.p, 0);
    let r = rng() * total;
    for (const e of disponiveis) { r -= e.p; if (r <= 0) { e.run(); break; } }
  }

  return { sortear };
});
