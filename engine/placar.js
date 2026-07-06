// Leaderboard: persistência em localStorage + seeds de exemplo.
// `storage` é injetável para testes; no browser cai no localStorage.
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.Fluxo = root.Fluxo || {}; root.Fluxo.placar = factory(); }
})(typeof window !== 'undefined' ? window : globalThis, function () {

  const CHAVE = 'simfin_lb_v1';

  const SEEDS = [
    { nome: 'ANA.DIVIDENDOS', status: 'livre', meses: 44, pat: 168000, tempo: 312 },
    { nome: 'CARLOS_CDB', status: 'livre', meses: 61, pat: 121000, tempo: 495 },
    { nome: 'JOAO.ALLIN.BTC', status: 'faliu', meses: 9, pat: 0, tempo: 84 },
    { nome: 'MARI_SEM_RESERVA', status: 'faliu', meses: 14, pat: 0, tempo: 130 },
  ];

  function storagePadrao() {
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
  }

  function salvar(s, patrimonio, storage) {
    const st = storage || storagePadrao();
    if (!st) return;
    try {
      const lb = JSON.parse(st.getItem(CHAVE) || '[]');
      lb.push({
        nome: 'VOCÊ · ' + new Date().toLocaleDateString('pt-BR'),
        status: s.fim,
        meses: s.mes,
        pat: Math.round(patrimonio),
        tempo: Math.round(((s.fimTs || Date.now()) - (s.inicioTs || Date.now())) / 1000),
        voce: true,
        ts: Date.now(),
      });
      st.setItem(CHAVE, JSON.stringify(lb.slice(-30)));
    } catch (e) { /* sem storage */ }
  }

  // Livres primeiro (menos meses ganha, tempo desempata); falidos por quem durou mais.
  function ler(storage) {
    const st = storage || storagePadrao();
    let salvos = [];
    try { salvos = JSON.parse((st && st.getItem(CHAVE)) || '[]'); } catch (e) {}
    const todos = [...SEEDS, ...salvos];
    todos.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'livre' ? -1 : 1;
      if (a.status === 'livre') return (a.meses - b.meses) || ((a.tempo || 9e9) - (b.tempo || 9e9));
      return b.meses - a.meses;
    });
    return todos.slice(0, 7);
  }

  return { CHAVE, salvar, ler };
});
