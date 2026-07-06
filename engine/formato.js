// Formatação de valores para exibição. Sem estado, sem regra de jogo.
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.Fluxo = root.Fluxo || {}; root.Fluxo.formato = factory(); }
})(typeof window !== 'undefined' ? window : globalThis, function () {

  function fmt(v) {
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }

  function fmtTempo(ms) {
    const t = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(t / 60), seg = t % 60;
    if (m >= 60) return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0') + ':' + String(seg).padStart(2, '0');
    return String(m).padStart(2, '0') + ':' + String(seg).padStart(2, '0');
  }

  // Converte o histórico de patrimônio nos pontos da polyline 180×34 do cabeçalho.
  function sparkline(hist) {
    const min = Math.min(...hist), max = Math.max(...hist), range = Math.max(1, max - min);
    const points = hist.map((v, i) => {
      const x = hist.length === 1 ? 90 : (i / (hist.length - 1)) * 176 + 2;
      const y = 30 - ((v - min) / range) * 26;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return { points, positivo: hist[hist.length - 1] >= hist[0] };
  }

  return { fmt, fmtTempo, sparkline };
});
