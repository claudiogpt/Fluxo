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

    // Modos de jogo exibidos no menu. Novos modos entram aqui com disponivel: false
    // até a mecânica existir — a tela inicial os mostra como "EM BREVE".
    modos: [
      { id: 'classico', nome: 'CLÁSSICO', descricao: 'Do zero à liberdade — ou à falência. Sobreviva aos meses e construa renda passiva.', disponivel: true },
      { id: 'sandbox', nome: 'SANDBOX', descricao: 'Sem falência e sem pressa: escolha o capital inicial e teste estratégias à vontade.', disponivel: true },
      { id: 'empresario', nome: 'EMPRESÁRIO', descricao: 'Sem salário: viva do seu negócio. Reinvestir pra crescer ou sacar pra investir? PJ não é seu bolso.', disponivel: true },
      { id: 'cenarios', nome: 'CENÁRIOS', descricao: 'Situações da vida real pra atravessar com as decisões certas de alocação.', disponivel: true },
      { id: 'speedrun', nome: 'SPEEDRUN', descricao: 'Seed compartilhada, relógio global e placar ranqueado. Quão rápido você se liberta?', disponivel: false },
    ],

    // Cenários dentro do modo CENÁRIOS. Novos entram aqui com disponivel: false até existir.
    cenarios: [
      { id: 'aposentadoria', nome: 'APOSENTADORIA', descricao: 'Acumule por alguns anos e depois viva só do patrimônio. A ORDEM dos anos bons e ruins decide se o dinheiro dura.', disponivel: true },
      { id: 'imoveis', nome: 'IMÓVEIS', descricao: 'Comprar financiado ou alugar e investir a diferença? Descubra qual estratégia sobra mais no fim.', disponivel: false },
    ],

    // Presets de capital inicial oferecidos no modo sandbox.
    sandbox: { capitais: [1000, 10000, 100000] },

    // Cenário aposentadoria. Números pensados pra playtest — todos ajustáveis aqui.
    aposentadoria: {
      capitalInicial: 30000,   // caixa no começo da acumulação
      salario: 6000,           // salário durante a acumulação (custo = salario * custoFator)
      turnosAcumulacao: 36,    // X meses acumulando livremente
      turnosSaque: 48,         // Y meses de saque a sobreviver (meta)
      taxaSaque: 0.04,         // usado só no modo "% do patrimônio" (fração por mês)
      // No modo FIXO (padrão) o saque mensal é o próprio custo de vida (que segue inflacionando).
    },

    // Modo empresário: o negócio que o jogador administra.
    empresario: {
      caixaInicial: 4000,      // capital de giro inicial (caixa da empresa)
      receitaBase: 7500,       // receita média mensal
      custoFixo: 3500,         // custos fixos mensais
      volReceita: 0.35,        // variância da receita (mesmo padrão de ruído dos ativos)
      reinvestimentoPasso: 1000, // custo de cada melhoria no negócio
      impulsoReceita: 180,     // ganho de receita/mês da 1ª melhoria…
      decaimento: 0.35,        // …decaindo: impulso / (1 + nivel * decaimento)
      mesesFalencia: 3,        // meses consecutivos no vermelho até a empresa falir
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
