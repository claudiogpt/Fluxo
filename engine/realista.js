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
    };
  }

  // ---------- mercado ----------

  /** Os fatores comuns de risco. Papéis que compartilham fator caem JUNTOS —
   *  é o que transforma "correlação" de texto de tooltip em mecânica. */
  const FATORES = ['juros', 'bolsaBR', 'intl', 'cripto'];

  /**
   * Aplica o retorno do mês a todos os ativos do catálogo.
   *
   * Renda fixa não sorteia nada: rende pelo indexador (Selic corrente, IPCA ou
   * a taxa travada na compra). Renda variável combina o fator comum da sua
   * classe com um ruído próprio — a parte que só acontece com ela.
   *
   * Consome 2 draws por fator (4) + 2 por ativo de renda variável (10) = 28.
   *
   * @param {GameState} s - Working copy of game state.
   * @param {() => number} rng - Injected randomness.
   * @returns {number} Cash income (dividends/rent) generated this month.
   */
  function mercado(s, rng) {
    const r = s.realista;
    const m = r.macro;
    const fatores = {};
    for (const f of FATORES) fatores[f] = ruido(rng);

    let renda = 0;
    for (const d of catalogo.defs) {
      const p = r.posicoes[d.key];
      let ret;
      if (d.indexador === 'selic') {
        ret = mensal(m.selic) * d.fatorIndex;
      } else if (d.indexador === 'ipca') {
        ret = mensal(m.ipca) + d.taxaContratada / 12;
      } else if (d.indexador === 'pre') {
        ret = d.taxaContratada / 12;
      } else {
        // 60% do movimento é a classe inteira, 40% é o papel — dois ativos da
        // mesma categoria andam juntos sem serem clones um do outro.
        ret = d.ret + d.vol * (0.6 * fatores[d.fator] + 0.4 * ruido(rng));
      }
      s.ativos[d.key] *= (1 + ret);
      s.varMes[d.key] = ret;
      // A curva é o valor sem marcação a mercado: o que o papel vale se você
      // segurar até o fim. Na F1 ainda não há marcação, então anda com o saldo.
      p.curva = s.ativos[d.key];
      renda += s.ativos[d.key] * d.div;
    }
    r.mesRenda = renda;
    return renda;
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
      v = Math.min(v, s.caixa);
      if (v < 1) return {};
      // Custo médio: o que entra puxa a idade média da posição pra cima do mês
      // atual, proporcionalmente ao tamanho do aporte.
      const custoAnt = p.custo;
      p.mesMedio = custoAnt + v > 0 ? (p.mesMedio * custoAnt + s.mes * v) / (custoAnt + v) : s.mes;
      p.custo = custoAnt + v;
      if (p.mesEntrada === null) p.mesEntrada = s.mes;
      a[key] += v;
      p.curva = a[key];
      return { ativos: a, caixa: s.caixa - v, realista: r };
    }

    v = Math.min(-v, a[key]);
    if (v < 1) return {};
    // Resgate proporcional: sai a mesma fatia do custo. `mesMedio` NÃO muda —
    // o que sai tem a mesma idade média do que fica.
    const fracao = v / a[key];
    p.custo = p.custo * (1 - fracao);
    a[key] -= v;
    p.curva = a[key];
    if (a[key] < 1) { p.mesEntrada = null; p.custo = 0; p.mesMedio = 0; }
    return { ativos: a, caixa: s.caixa + v, realista: r };
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
      const bruto = Math.min(s.ativos[key], deficit / d.desagio);
      const liquido = bruto * d.desagio;
      const fracao = bruto / s.ativos[key];
      const p = r.posicoes[key];
      p.custo = p.custo * (1 - fracao);
      s.ativos[key] -= bruto;
      if (s.ativos[key] < 1) { p.mesEntrada = null; p.custo = 0; p.mesMedio = 0; }
      p.curva = s.ativos[key];
      deficit -= liquido;
      const perda = Math.round((1 - d.desagio) * 100);
      avisar('⚠ ' + d.nome + ' liquidado às pressas' + (perda > 0 ? ' com ' + perda + '% de perda' : ' — sem perdas') + '.',
        perda > 5 ? '#ff9d4b' : '#ffc24b');
    }
    return deficit;
  }

  return { novoEstado, clonar, posicaoZerada, mercado, mover, cobrir, mensal };
});
