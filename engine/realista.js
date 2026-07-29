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

  /** Posição zerada. `mesEntrada` null = nunca teve aporte (não há carência a contar). */
  function posicaoZerada() {
    return { saldo: 0, custo: 0, mesMedio: 0, mesEntrada: null, curva: 0 };
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

  return { novoEstado, clonar, posicaoZerada };
});
