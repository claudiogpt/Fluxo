/**
 * @module ativos
 * Definição dos 5 ativos investíveis (lista exportada pelo UMD).
 * Campos: `ret` retorno médio mensal, `vol` volatilidade, `div` rendimento em caixa,
 * `risco`/`riscoCor` para UI. A ordem de liquidação forçada está em config.liquidacao.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.Fluxo = root.Fluxo || {}; root.Fluxo.ativos = factory(); }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  return [
    { key: 'reserva', nome: 'RESERVA DE EMERGÊNCIA', ticker: 'CDI 100%', ret: 0.009, vol: 0, div: 0.009, risco: 'SEGURO', riscoCor: '#22d47e', dica: 'Rende pouco, mas é resgatada sem perda quando a vida cobra. Sem ela, emergência vira liquidação forçada.' },
    { key: 'rendafixa', nome: 'RENDA FIXA', ticker: 'TESOURO/CDB', ret: 0.015, vol: 0.004, div: 0.015, risco: 'BAIXO', riscoCor: '#8fd47e', dica: 'Juros compostos previsíveis. Resgate de emergência tem pequeno deságio.' },
    { key: 'fiis', nome: 'FUNDOS IMOBILIÁRIOS', ticker: 'IFIX', ret: 0.005, vol: 0.04, div: 0.028, risco: 'MÉDIO', riscoCor: '#ffc24b', dica: 'Pagam "aluguel" todo mês direto no caixa — a renda passiva mais forte do jogo. Cota oscila.' },
    { key: 'acoes', nome: 'AÇÕES', ticker: 'IBOV', ret: 0.022, vol: 0.08, div: 0.01, risco: 'ALTO', riscoCor: '#ff9d4b', dica: 'Maior potencial de crescimento, quedas de 30% acontecem. Dividendos moderados.' },
    { key: 'cripto', nome: 'CRIPTO', ticker: 'BTC/ETH', ret: 0.035, vol: 0.24, div: 0, risco: 'EXTREMO', riscoCor: '#ff4d5e', dica: 'Pode dobrar, pode derreter 45% num mês. Não gera renda passiva nenhuma.' },
  ];
});
