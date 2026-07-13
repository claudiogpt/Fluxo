// Placar global: um board por modo, com envio pro Supabase quando configurado
// (config.placarOnline) e fallback em localStorage quando offline/sem chaves.
// `storage` e `fetchFn` são injetáveis para testes.
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

  function storagePadrao() {
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
  }

  // ---------- nickname ----------

  function nick(storage) {
    const st = storage || storagePadrao();
    try { return (st && st.getItem(CHAVE_NICK)) || ''; } catch (e) { return ''; }
  }

  function salvarNick(nome, storage) {
    const st = storage || storagePadrao();
    if (!st) return;
    try { st.setItem(CHAVE_NICK, String(nome || '').slice(0, 16)); } catch (e) {}
  }

  // ---------- registro de partida ----------

  // Board da partida: cenários viram boards próprios (aposentadoria, imoveis).
  function boardDe(s) {
    return s.modo === 'cenarios' ? s.cenario : s.modo;
  }

  // Score único, maior = melhor, comparável dentro de um mesmo board:
  // vitórias partem de 1e12 (sempre acima de qualquer derrota);
  // corrida contra o tempo (clássico/empresário/sandbox) premia menos meses,
  // boards de patrimônio (aposentadoria/imóveis) premiam o patrimônio final;
  // derrotas rankeiam por quem durou mais meses.
  function scoreDe(modo, resultado, meses, pat, tempo) {
    if (VITORIAS.indexOf(resultado) < 0) return meses;
    if (modo === 'aposentadoria' || modo === 'imoveis') return 1e12 + Math.max(0, pat);
    return 1e12 - meses * 1e6 - Math.min(Math.max(0, tempo), 999999);
  }

  // Nome apto pro placar: sem caracteres de controle, 1–16 chars, nunca vazio.
  // Espelha os CHECKs do banco (supabase/hardening.sql) pra partida legítima
  // nunca ser rejeitada no insert.
  function nomeLimpo(nome) {
    const limpo = String(nome || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 16);
    return limpo || 'ANÔNIMO';
  }

  // Monta o registro a partir do estado final. `resultado` sobrescreve s.fim
  // (o sandbox nunca "termina": registra quando cruza o marco da liberdade).
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

  function vitoria(resultado) { return VITORIAS.indexOf(resultado) >= 0; }

  function ordenar(lista) {
    return [...lista].sort((a, b) => (b.score - a.score) || ((a.ts || 0) - (b.ts || 0)));
  }

  // ---------- placar local (fallback e histórico próprio) ----------

  function salvar(rec, storage) {
    const st = storage || storagePadrao();
    if (!st) return;
    try {
      const lb = JSON.parse(st.getItem(CHAVE) || '[]');
      lb.push({ ...rec, voce: true, ts: Date.now() });
      st.setItem(CHAVE, JSON.stringify(lb.slice(-100)));
    } catch (e) { /* sem storage */ }
  }

  function ler(modo, storage) {
    const st = storage || storagePadrao();
    let salvos = [];
    try { salvos = JSON.parse((st && st.getItem(CHAVE)) || '[]'); } catch (e) {}
    return ordenar(salvos.filter(r => r.modo === modo)).slice(0, 10);
  }

  // ---------- placar online (Supabase REST) ----------

  function cfgPadrao() { return (config && config.placarOnline) || {}; }

  function online(cfg) {
    const c = cfg || cfgPadrao();
    return !!(c.url && c.anonKey);
  }

  function cabecalhos(c) {
    return {
      apikey: c.anonKey,
      Authorization: 'Bearer ' + c.anonKey,
      'Content-Type': 'application/json',
    };
  }

  // Aceita a url tanto na forma base (https://x.supabase.co) quanto já com o
  // sufixo /rest/v1 que o painel do Supabase às vezes mostra — sem duplicar.
  function urlTabela(c) {
    const base = c.url.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
    return base + '/rest/v1/' + (c.tabela || 'placar');
  }

  // Envia um registro; resolve true/false, nunca rejeita (o jogo segue offline).
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

  // Top 10 do board; resolve null quando offline/deu erro (caller cai no local).
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
