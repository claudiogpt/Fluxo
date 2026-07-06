// Eventos aleatórios do jogo: tabela de pesos + sorteio.
// Cada evento muta o estado de trabalho `s` (cópia do turno) e registra no log.
// `s.pendente` acumula gastos debitados no fim do turno.
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./config.js'), require('./formato.js'));
  } else {
    root.Fluxo = root.Fluxo || {};
    root.Fluxo.eventos = factory(root.Fluxo.config, root.Fluxo.formato);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (config, formato) {

  const fmt = formato.fmt;

  // ctx: { rng: () => number, addLog: (s, logs, texto, cor, mes) => void }
  function sortear(s, logs, ctx) {
    const rng = ctx.rng || Math.random;
    const addLog = ctx.addLog;
    const dif = config.dificuldades[s.hard ? 'hardcore' : 'normal'];
    if (rng() > dif.chanceEvento || s.mes < config.mesMinimoEvento) return;
    const eventos = [
      { p: 16, run: () => { s.ativos.acoes *= 0.7; s.ativos.fiis *= 0.88; addLog(s, logs, '▼ CRASH DA BOLSA. Ações −30%, FIIs −12%. Quem vende no pânico realiza o prejuízo.', '#ff4d5e', s.mes); } },
      { p: 12, run: () => { s.ativos.cripto *= 0.55; addLog(s, logs, '▼ INVERNO CRIPTO. −45% num mês. Era o dinheiro do aluguel?', '#ff4d5e', s.mes); } },
      { p: 10, run: () => { s.ativos.cripto *= 1.6; addLog(s, logs, '▲ BULL RUN CRIPTO. +60%. Cuidado: euforia não é estratégia.', '#22d47e', s.mes); } },
      { p: 16, run: () => { const c = Math.round(s.custo * (0.8 + rng() * 1.4) * Math.min(1, s.mes / 12)); s.pendente = (s.pendente || 0) + c; addLog(s, logs, '✚ EMERGÊNCIA MÉDICA: −' + fmt(c) + '. É pra isso que existe reserva.', '#ff9d4b', s.mes); } },
      { p: 12, run: () => { const c = Math.round(s.custo * (0.35 + rng() * 0.55) * Math.min(1, s.mes / 12)); s.pendente = (s.pendente || 0) + c; addLog(s, logs, '✚ IMPREVISTO (carro/casa): −' + fmt(c) + '.', '#ff9d4b', s.mes); } },
      { p: 12, run: () => { s.custo = Math.round(s.custo * 1.04); addLog(s, logs, '▲ INFLAÇÃO ALTA. Custo de vida +4%. Seu dinheiro parado vale menos.', '#ffc24b', s.mes); } },
      { p: 8, run: () => { s.semSalario = s.mes < 18 ? 1 : 2; addLog(s, logs, '✖ DEMISSÃO. ' + (s.mes < 18 ? '1 mês' : '2 meses') + ' sem salário. Renda passiva e reserva seguram as pontas?', '#ff4d5e', s.mes); } },
      { p: 8, run: () => { s.salario = Math.round(s.salario * 1.08); addLog(s, logs, '▲ PROMOÇÃO. Salário +8%. Aumentar aporte > aumentar padrão de vida.', '#22d47e', s.mes); } },
      { p: 6, run: () => { s.caixa += s.salario; addLog(s, logs, '▲ 13º / BÔNUS: +' + fmt(s.salario) + ' no caixa. Investe ou torra?', '#22d47e', s.mes); } },
      { p: 5, run: () => { const g = Math.round(s.custo * (3 + rng() * 4)); s.caixa += g; addLog(s, logs, '▲ GRANA INESPERADA (herança/restituição): +' + fmt(g) + '. Torrar ou acelerar a liberdade?', '#22d47e', s.mes); } },
    ];
    const total = eventos.reduce((t, e) => t + e.p, 0);
    let r = rng() * total;
    for (const e of eventos) { r -= e.p; if (r <= 0) { e.run(); break; } }
  }

  return { sortear };
});
