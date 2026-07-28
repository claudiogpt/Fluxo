/**
 * @file Formatação de valores para exibição. Sem estado, sem regra de jogo.
 * @typedef {import('./typedefs.jsdoc').SparklineResult} SparklineResult
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.Fluxo = root.Fluxo || {}; root.Fluxo.formato = factory(); }
})(typeof window !== 'undefined' ? window : globalThis, function () {

  /**
   * Formata valor monetário em reais (arredondado, locale pt-BR).
   *
   * @param {number} v - Amount in BRL.
   * @returns {string} e.g. `"R$ 4.500"`.
   */
  function fmt(v) {
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }

  /**
   * Formata duração em mm:ss ou h:mm:ss.
   *
   * @param {number} ms - Elapsed milliseconds.
   * @returns {string} Zero-padded time string.
   */
  function fmtTempo(ms) {
    const t = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(t / 60), seg = t % 60;
    if (m >= 60) return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0') + ':' + String(seg).padStart(2, '0');
    return String(m).padStart(2, '0') + ':' + String(seg).padStart(2, '0');
  }

  /**
   * Formata valor compacto para espaços apertados (placar).
   *
   * @param {number} v - Amount in BRL.
   * @returns {string} e.g. `"R$ 12k"`, `"R$ 1,3M"`.
   */
  function fmtCompacto(v) {
    const n = Math.round(v);
    const abs = Math.abs(n);
    if (abs >= 1e6) return 'R$ ' + (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'M';
    if (abs >= 1e3) return 'R$ ' + Math.round(n / 1e3).toLocaleString('pt-BR') + 'k';
    return 'R$ ' + n.toLocaleString('pt-BR');
  }

  /**
   * Converte histórico de patrimônio em pontos SVG para sparkline 180×34.
   *
   * @param {number[]} hist - Net-worth samples over time.
   * @returns {SparklineResult} Polyline points and trend direction.
   */
  function sparkline(hist) {
    const min = Math.min(...hist), max = Math.max(...hist), range = Math.max(1, max - min);
    const points = hist.map((v, i) => {
      const x = hist.length === 1 ? 90 : (i / (hist.length - 1)) * 176 + 2;
      const y = 30 - ((v - min) / range) * 26;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return { points, positivo: hist[hist.length - 1] >= hist[0] };
  }

  return { fmt, fmtCompacto, fmtTempo, sparkline };
});
