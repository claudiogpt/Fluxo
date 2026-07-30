/**
 * @module config
 * Balanceamento do jogo — todos os números de ajuste moram aqui.
 * Contém: dificuldades, modos, cenários, parâmetros de aposentadoria/imóveis/empresário,
 * ordem de liquidação, placar online (Supabase) e limites globais (log, eventos).
 * Mexeu em salário, inflação ou deságio? É neste arquivo.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.Fluxo = root.Fluxo || {}; root.Fluxo.config = factory(); }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  return {
    salarioDefault: 4500,

    dificuldades: {
      normal:   { caixaInicial: 3000, custoFator: 0.70, chanceEvento: 0.42, inflacaoBase: 1.004 },
      hardcore: { caixaInicial: 1500, custoFator: 0.76, chanceEvento: 0.55, inflacaoBase: 1.005 },
      hiperinflacão: { caixaInicial: 3000, custoFator: 0.72, chanceEvento: 0.55, inflacaoBase: 1.030 },
    },

    // Modos de jogo exibidos no menu. Novos modos entram aqui com disponivel: false
    // até a mecânica existir — a tela inicial os mostra como "EM BREVE".
    modos: [
      { id: 'tutorial', nome: 'TUTORIAL · 6 MESES · ~4 MIN', descricao: 'As mecânicas na prática, com prazo declarado: aloca, fecha o mês, vê o que acontece. Acaba sozinho e não pontua.', disponivel: true },
      { id: 'classico', nome: 'CLÁSSICO', descricao: 'Do zero à liberdade — ou à falência. Sobreviva aos meses e construa renda passiva.', disponivel: true },
      { id: 'sandbox', nome: 'SANDBOX', descricao: 'Sem falência e sem pressa: escolha o capital inicial e teste estratégias à vontade.', disponivel: true },
      { id: 'empresario', nome: 'EMPRESÁRIO', descricao: 'Sem salário: viva do seu negócio. Reinvestir pra crescer ou sacar pra investir? PJ não é seu bolso.', disponivel: true },
      { id: 'cenarios', nome: 'CENÁRIOS', descricao: 'Situações da vida real pra atravessar com as decisões certas de alocação.', disponivel: true },
      { id: 'realista', nome: 'REALISTA', descricao: 'A carteira completa: 15 ativos em 5 categorias, com imposto, liquidez, custos e a Selic se movendo embaixo de você.', disponivel: true },
    ],

    // Placar global (Supabase). Preencha url e anonKey pra ligar o online;
    // vazio = placar local por dispositivo. A anonKey é pública por design (RLS).
    placarOnline: {
      url: 'https://cxzotdgpjizmkecqrxuo.supabase.co/rest/v1/',      // ex.: 'https://xxxx.supabase.co'
      anonKey: 'sb_publishable_Ml1CcZxzZaYdbdGa1ZSZLw_8Wxzn41P',
      tabela: 'placar',
    },

    // Cenários dentro do modo CENÁRIOS. Novos entram aqui com disponivel: false até existir.
    cenarios: [
      { id: 'aposentadoria', nome: 'APOSENTADORIA', descricao: 'Acumule por alguns anos e depois viva só do patrimônio. A ORDEM dos anos bons e ruins decide se o dinheiro dura.', disponivel: true },
      { id: 'imoveis', nome: 'IMÓVEIS', descricao: 'Comprar financiado ou alugar e investir a diferença? Descubra qual estratégia sobra mais no fim.', disponivel: true },
    ],

    // Presets de capital inicial oferecidos no modo sandbox.
    sandbox: { capitais: [1000, 10000, 100000] },

    // Modo tutorial: o clássico com prazo. Não tem regra própria — é um
    // `desafio` de 6 meses na dificuldade normal, e por isso não pontua.
    tutorial: { meses: 6 },

    // TREINO: posições difíceis com objetivo fechado. Mecanicamente são
    // CENÁRIOS (mesmo modo, mesmo board de placar, mesma tela de setup) — o
    // que muda é que a partida já começa alocada, o roteiro é fixo (a mesma
    // cena toda vez, senão não é exercício) e existe prazo.
    //
    // `alocacaoInicial` usa as chaves de engine/ativos.js; `roteiro` usa os
    // ids de eventos.ROTEIRAVEIS; `desafio.meses` é o prazo a atravessar.
    treinos: [
      {
        id: 'treino_crash',
        nome: 'ATRAVESSAR UM CRASH',
        descricao: 'Carteira montada, dois meses de reserva e a bolsa desabando no mês 2 — com a demissão logo atrás. Chegue ao mês 8 sem quebrar.',
        disponivel: true,
        caixaInicial: 0,
        alocacaoInicial: { reserva: 6300, acoes: 24000 },
        roteiro: [
          { mes: 2, evento: 'crash' },
          { mes: 3, evento: 'demissao' },
          { mes: 5, evento: 'emergencia' },
        ],
        desafio: { meses: 8 },
        estudo: 'liquidez-e-venda-forcada',
      },
      {
        id: 'treino_saque',
        nome: 'O PRIMEIRO ANO SEM SALÁRIO',
        descricao: 'Sem renda do trabalho: o custo de vida sai do patrimônio todo mês, e o mercado desaba logo no começo. Atravesse 12 meses.',
        disponivel: true,
        salario: 0,
        caixaInicial: 4000,
        alocacaoInicial: { reserva: 12000, rendafixa: 30000, fiis: 20000, acoes: 40000 },
        roteiro: [{ mes: 2, evento: 'crash' }],
        desafio: { meses: 12 },
        estudo: 'sequencia-de-retornos',
      },
    ],

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

    // Cenário imóveis: comprar financiado vs alugar e investir a diferença.
    // O custo de vida aqui EXCLUI moradia — a moradia é a decisão do cenário.
    imoveis: {
      salario: 8000,
      custoFator: 0.45,        // custo de vida sem moradia
      capitalInicial: 30000,   // dá pra entrada sobrar reserva
      valorImovel: 120000,
      entradaPct: 0.20,        // entrada de 20% (R$ 24.000)
      jurosMes: 0.01,          // juros mensais do financiamento (tabela Price)
      prazoMeses: 48,          // prazo do financiamento = duração do cenário
      aluguel: 1200,           // aluguel do imóvel equivalente (1% do valor)
      valorizacaoMes: 0.015,   // valorização média mensal do imóvel (taxa própria)
      volImovel: 0.01,         // ruído da valorização
    },

    // Modo realista: o carro-chefe. As propriedades de cada PAPEL (retorno,
    // carência, tributação) moram em engine/catalogo.js — aqui ficam só os
    // números que valem pro modo inteiro.
    realista: {
      caixaInicial: 5000,
      salario: 6000,
      custoFator: 0.62,

      // Ciclo macro. A Selic passeia em direção ao alvo (reversão à média) com
      // ruído; os eventos de COPOM movem o ALVO, não a taxa — é o que faz um
      // choque de juros durar meses em vez de um turno.
      selicAlta: 0.1365,
      selicBaixa: 0.06,
      ipcaInicial: 0.045,
      reversao: 0.08,          // fração do gap percorrida por mês
      // 0,5 p.p. de ruído por mês é a ordem de grandeza de uma reunião do
      // COPOM de verdade (0,25 a 0,50). Com 0,3 o juro mal se mexia e a
      // marcação a mercado nunca vencia o rendimento do papel.
      volSelic: 0.005,
      volIpca: 0.003,
      selicMin: 0.02,
      selicMax: 0.22,
      ipcaMin: 0.005,
      ipcaMax: 0.20,
      // Regra de reação: com o juro REAL abaixo disso, o COPOM não corta. É o
      // que impede o absurdo de juro caindo com inflação de dois dígitos.
      juroRealMinimoPraCortar: 0.02,

      // Imposto de renda. A tabela regressiva é [mesesAté, alíquota]: quem
      // segura por mais tempo paga menos — a lição inteira em quatro linhas.
      aliquotasRF: [[6, 0.225], [12, 0.20], [24, 0.175], [9999, 0.15]],
      irAcoes: 0.15,
      irFii: 0.20,
      irCripto: 0.15,
      irComeCotas: 0.15,
      isencaoAcoes: 20000,     // teto MENSAL de VENDAS (não de lucro) isentas
      isencaoCripto: 35000,
      comeCotasMeses: 6,

      // Custos. `ordemMinima` é só didático: abaixo disso o log avisa que a
      // corretagem come o aporte, sem bloquear a ordem.
      ordemMinima: 20,
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
