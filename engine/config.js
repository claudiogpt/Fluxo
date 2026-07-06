// Balanceamento do jogo — todos os números de ajuste moram aqui.
// Mexeu em dificuldade, inflação ou deságio? É neste arquivo.
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.Fluxo = root.Fluxo || {}; root.Fluxo.config = factory(); }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  return {
    salarioDefault: 4500,

    dificuldades: {
      normal:   { caixaInicial: 3000, custoFator: 0.70, chanceEvento: 0.42, inflacaoBase: 1.004 },
      hardcore: { caixaInicial: 1500, custoFator: 0.76, chanceEvento: 0.55, inflacaoBase: 1.005 },
    },

    // Eventos aleatórios só começam a partir deste mês.
    mesMinimoEvento: 3,

    // Aumento salarial automático a cada 12 meses (se empregado).
    progressaoAnual: 1.10,

    // Tamanho máximo do log de eventos exibido no terminal.
    logMax: 60,

    // Ordem de liquidação forçada quando o caixa fica negativo:
    // [chave do ativo, fator líquido recebido, mensagem no terminal]
    liquidacao: [
      ['reserva', 1, 'Reserva de emergência usada — sem perdas. Pra isso ela existe.'],
      ['rendafixa', 0.98, 'Renda fixa resgatada com 2% de deságio.'],
      ['fiis', 0.9, 'FIIs vendidos às pressas com 10% de perda.'],
      ['acoes', 0.9, 'Ações liquidadas na marra com 10% de perda.'],
      ['cripto', 0.85, 'Cripto vendida no desespero com 15% de perda.'],
    ],
  };
});
