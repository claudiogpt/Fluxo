/**
 * @file Placar global: um board por modo, Supabase quando configurado,
 * fallback em localStorage quando offline ou sem chaves.
 * `storage` e `fetchFn` são injetáveis para testes.
 * @typedef {import('./typedefs.jsdoc').GameState} GameState
 * @typedef {import('./typedefs.jsdoc').RegistroPlacar} RegistroPlacar
 * @typedef {import('./typedefs.jsdoc').StorageLike} StorageLike
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(
    typeof require !== 'undefined' ? require('./config.js') : (root.Fluxo || {}).config
  );
  else { root.Fluxo = root.Fluxo || {}; root.Fluxo.placar = factory(root.Fluxo.config); }
})(typeof window !== 'undefined' ? window : globalThis, function (config) {

  const CHAVE = 'fluxo_placar_v2';
  const CHAVE_NICK = 'fluxo_nick';

  // Resultados que valem "vitória" — dominam o ranking do board.
  const VITORIAS = ['livre', 'marco', 'apos_sucesso', 'imoveis_fim'];

  /** @returns {StorageLike|null} Browser localStorage or null if unavailable. */
  function storagePadrao() {
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
  }

  /**
   * Lê o nickname salvo do jogador.
   *
   * @param {StorageLike|null} [storage] - Injectable storage (default localStorage).
   * @returns {string} Nick up to 16 chars, or empty string.
   */
  function nick(storage) {
    const st = storage || storagePadrao();
    try { return (st && st.getItem(CHAVE_NICK)) || ''; } catch (e) { return ''; }
  }

  /**
   * Persiste o nickname do jogador.
   *
   * @param {string} nome - Display name (trimmed to 16 chars).
   * @param {StorageLike|null} [storage] - Injectable storage.
   */
  function salvarNick(nome, storage) {
    const st = storage || storagePadrao();
    if (!st) return;
    try { st.setItem(CHAVE_NICK, String(nome || '').slice(0, 16)); } catch (e) {}
  }

  /**
   * Resolve o id do board de ranking para a partida atual.
   *
   * Cenários viram boards próprios (`aposentadoria`, `imoveis`); demais modos usam `modo`.
   *
   * @param {Pick<GameState, 'modo'|'cenario'>} s - Game state or subset.
   * @returns {string} Board key for local/remote leaderboard.
   */
  function boardDe(s) {
    return s.modo === 'cenarios' ? s.cenario : s.modo;
  }

  /**
   * Calcula score único para ranking (maior = melhor dentro do mesmo board).
   *
   * Vitórias partem de 1e12; modos de tempo premiam menos meses;
   * aposentadoria/imóveis premiam patrimônio final; derrotas rankeiam por meses sobrevividos.
   *
   * @param {string} modo - Board id.
   * @param {string} resultado - Outcome code (`livre`, `faliu`, `marco`, etc.).
   * @param {number} meses - Months played.
   * @param {number} pat - Final net worth in BRL.
   * @param {number} tempo - Elapsed seconds.
   * @returns {number} Comparable score for sorting.
   */
  function scoreDe(modo, resultado, meses, pat, tempo) {
    if (VITORIAS.indexOf(resultado) < 0) return meses;
    if (modo === 'aposentadoria' || modo === 'imoveis') return 1e12 + Math.max(0, pat);
    return 1e12 - meses * 1e6 - Math.min(Math.max(0, tempo), 999999);
  }

  /**
   * Sanitiza nome para insert no placar (espelha CHECKs do Supabase).
   *
   * @param {string} nome - Raw player name.
   * @returns {string} Clean name 1–16 chars, never empty.
   */
  function nomeLimpo(nome) {
    const limpo = String(nome || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 16);
    return limpo || 'ANÔNIMO';
  }

  /**
   * Monta registro de partida a partir do estado final.
   *
   * `resultado` sobrescreve `s.fim` (sandbox registra no marco, não no fim).
   *
   * @param {GameState} s - Final or milestone game state.
   * @param {number} patrimonio - Net worth at registration time.
   * @param {string} nome - Player display name.
   * @param {string} [resultado] - Override outcome code.
   * @returns {RegistroPlacar} Record ready for local save or remote POST.
   */
  function registro(s, patrimonio, nome, resultado) {
    const modo = boardDe(s);
    const res = resultado || s.fim;
    const meses = Math.max(0, Math.min(9999, s.mes)); // limites do CHECK no banco
    const pat = Math.round(patrimonio);
    const ini = s.inicioTs == null ? Date.now() : s.inicioTs;
    const fimTs = s.fimTs == null ? Date.now() : s.fimTs;
    const tempo = Math.max(0, Math.round((fimTs - ini) / 1000));
    const detalhe = modo === 'sandbox' ? String(s.capitalInicial || '')
      : modo === 'aposentadoria' ? (s.aposentadoria ? s.aposentadoria.saqueModo : '')
      : modo === 'imoveis' ? (s.imoveis ? s.imoveis.escolha : '')
      : '';
    return {
      nome: nomeLimpo(nome),
      modo, detalhe,
      dificuldade: s.dificuldade || 'normal',
      resultado: res, meses, pat, tempo,
      score: scoreDe(modo, res, meses, pat, tempo),
    };
  }

  /**
   * Indica se o resultado conta como vitória no ranking.
   *
   * @param {string} resultado - Outcome code.
   * @returns {boolean} True for win-tier results.
   */
  function vitoria(resultado) { return VITORIAS.indexOf(resultado) >= 0; }

  /**
   * Ordena registros por score descendente, desempate por timestamp.
   *
   * @param {RegistroPlacar[]} lista - Unsorted records.
   * @returns {RegistroPlacar[]} New sorted array.
   */
  function ordenar(lista) {
    return [...lista].sort((a, b) => (b.score - a.score) || ((a.ts || 0) - (b.ts || 0)));
  }

  /**
   * Grava registro no placar local (localStorage, últimos 100).
   *
   * @param {RegistroPlacar} rec - Record to append.
   * @param {StorageLike|null} [storage] - Injectable storage.
   */
  function salvar(rec, storage) {
    const st = storage || storagePadrao();
    if (!st) return;
    try {
      const lb = JSON.parse(st.getItem(CHAVE) || '[]');
      lb.push({ ...rec, voce: true, ts: Date.now() });
      st.setItem(CHAVE, JSON.stringify(lb.slice(-100)));
    } catch (e) { /* sem storage */ }
  }

  /**
   * Lê top 10 local de um board.
   *
   * @param {string} modo - Board id.
   * @param {StorageLike|null} [storage] - Injectable storage.
   * @returns {RegistroPlacar[]} Top 10 sorted by score.
   */
  function ler(modo, storage) {
    const st = storage || storagePadrao();
    let salvos = [];
    try { salvos = JSON.parse((st && st.getItem(CHAVE)) || '[]'); } catch (e) {}
    return ordenar(salvos.filter(r => r.modo === modo)).slice(0, 10);
  }

  /** @returns {Object} Supabase config from config.placarOnline. */
  function cfgPadrao() { return (config && config.placarOnline) || {}; }

  /**
   * Verifica se placar remoto está configurado (url + anonKey).
   *
   * @param {Object|null} [cfg] - Override config.
   * @returns {boolean} True when remote leaderboard is available.
   */
  function online(cfg) {
    const c = cfg || cfgPadrao();
    return !!(c.url && c.anonKey);
  }

  /**
   * Monta headers REST para Supabase PostgREST.
   *
   * @param {Object} c - Config with anonKey.
   * @returns {Object} Fetch headers object.
   */
  function cabecalhos(c) {
    return {
      apikey: c.anonKey,
      Authorization: 'Bearer ' + c.anonKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Normaliza URL base e monta endpoint da tabela placar.
   *
   * @param {Object} c - Config with url and tabela.
   * @returns {string} Full REST endpoint URL.
   */
  function urlTabela(c) {
    const base = c.url.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
    return base + '/rest/v1/' + (c.tabela || 'placar');
  }

  /**
   * Envia registro ao placar global via Supabase REST.
   *
   * Nunca rejeita a Promise — retorna false em erro (jogo segue offline).
   *
   * @param {RegistroPlacar} rec - Record to POST.
   * @param {Object|null} [cfg] - Override Supabase config.
   * @param {typeof fetch|null} [fetchFn] - Injectable fetch for tests.
   * @returns {Promise<boolean>} True if HTTP 2xx.
   */
  function enviarRemoto(rec, cfg, fetchFn) {
    const c = cfg || cfgPadrao();
    const f = fetchFn || (typeof fetch !== 'undefined' ? fetch : null);
    if (!online(c) || !f) return Promise.resolve(false);
    const { nome, modo, detalhe, dificuldade, resultado, meses, pat, tempo, score } = rec;
    return f(urlTabela(c), {
      method: 'POST',
      headers: { ...cabecalhos(c), Prefer: 'return=minimal' },
      body: JSON.stringify({ nome, modo, detalhe, dificuldade, resultado, meses, pat, tempo, score }),
    }).then(r => r.ok).catch(() => false);
  }

  /**
   * Busca top 10 global de um board via Supabase REST.
   *
   * @param {string} modo - Board id.
   * @param {Object|null} [cfg] - Override Supabase config.
   * @param {typeof fetch|null} [fetchFn] - Injectable fetch for tests.
   * @returns {Promise<RegistroPlacar[]|null>} Top 10 or null when offline/error.
   */
  function lerRemoto(modo, cfg, fetchFn) {
    const c = cfg || cfgPadrao();
    const f = fetchFn || (typeof fetch !== 'undefined' ? fetch : null);
    if (!online(c) || !f) return Promise.resolve(null);
    const q = '?modo=eq.' + encodeURIComponent(modo) + '&order=score.desc,criado_em.asc&limit=10';
    return f(urlTabela(c) + q, { headers: cabecalhos(c) })
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  return { CHAVE, CHAVE_NICK, nick, salvarNick, boardDe, registro, vitoria, ordenar, salvar, ler, online, enviarRemoto, lerRemoto };
});
