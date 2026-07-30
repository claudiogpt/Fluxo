/**
 * @module catalogo
 * Catálogo de ativos do modo REALISTA — 15 ativos em 5 categorias.
 *
 * Por que um arquivo separado de `ativos.js`: aquele array é iterado por
 * `chavesZeradas`, pelo loop de mercado, por `rendaPassiva` e por `patrimonio`.
 * Acrescentar 15 chaves lá mudaria o estado inicial, a contagem de `rng` e o
 * patrimônio de TODOS os modos. Aqui, nada disso vaza: só quem tem
 * `s.realista` enxerga este catálogo.
 *
 * Campos de uma definição:
 * - `categoria`     id da categoria (agrupa na UI e na subtela)
 * - `indexador`     'selic' | 'ipca' | 'pre' | null (null = renda variável)
 * - `fatorIndex`    multiplicador do indexador (CDB 110% do CDI = 1.10)
 * - `taxaContratada` taxa a.a. travada na compra (pré e IPCA+)
 * - `duration`      anos — sensibilidade da marcação a mercado
 * - `fator`         fator comum de risco: papéis que compartilham fator caem juntos
 * - `beta`          sensibilidade a variação de juros (renda variável)
 * - `ret|vol|div`   retorno médio mensal, volatilidade e renda paga EM CAIXA
 * - `tributacao`    'rf' | 'acoes' | 'fii' | 'cripto' | 'isento'
 * - `isencao`       participa do teto de isenção mensal da sua classe
 * - `carencia`      meses travados após a entrada
 * - `venceEm`       meses até o vencimento (null = sem vencimento)
 * - `taxaAdm`       taxa de administração a.a., cobrada do SALDO
 * - `corretagem`    custo fixo por ordem; `spread` é a versão proporcional
 * - `comeCotas`     antecipação semestral de IR
 * - `desagio`       fator recebido na venda forçada (liquidação)
 * - `conceito`      id do tooltip educacional disparado no 1º aporte
 *
 * Os números de balanceamento que NÃO são propriedade do papel (alíquotas,
 * tetos de isenção, ciclo macro) ficam em `config.realista`.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.Fluxo = root.Fluxo || {}; root.Fluxo.catalogo = factory(); }
})(typeof window !== 'undefined' ? window : globalThis, function () {

  // Ordem = ordem de exibição na tela e nas subtelas.
  const categorias = [
    { id: 'rf', nome: 'RENDA FIXA', dica: 'Onde o juro do país vira o seu juro. Pós, pré e indexado reagem de formas OPOSTAS ao mesmo movimento da Selic.' },
    { id: 'fii', nome: 'FUNDOS IMOBILIÁRIOS', dica: 'Aluguel todo mês, isento de IR, sem síndico nem inquilino. A cota oscila como ação.' },
    { id: 'acoes', nome: 'AÇÕES BR', dica: 'Sócio de empresa brasileira. Dentro da mesma classe ainda há três apostas bem diferentes.' },
    { id: 'intl', nome: 'INTERNACIONAL', dica: 'Quando o Brasil vai mal, o dólar costuma ir bem. Diversificação geográfica é defesa, não modinha.' },
    { id: 'cripto', nome: 'CRIPTO', dica: 'O ativo mais volátil da mesa e o único que não paga nada por existir. Tempero, não prato principal.' },
  ];

  const defs = [
    // ---------- RENDA FIXA ----------
    {
      key: 'rf_selic', nome: 'TESOURO SELIC', ticker: 'LFT', categoria: 'rf',
      indexador: 'selic', fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: null, beta: 0, ret: 0, vol: 0, div: 0,
      tributacao: 'rf', isencao: false, carencia: 0, venceEm: null,
      taxaAdm: 0, corretagem: 0, spread: 0, comeCotas: false, desagio: 1,
      risco: 'SEGURO', riscoCor: '#22d47e', conceito: 'posFixado',
      dica: 'Acompanha a Selic todo dia e não perde valor se você sair antes. É o lugar da reserva de emergência.',
    },
    {
      key: 'rf_ipca', nome: 'TESOURO IPCA+', ticker: 'NTN-B 2035', categoria: 'rf',
      indexador: 'ipca', fatorIndex: 1, taxaContratada: 0.06, duration: 7,
      fator: null, beta: 0, ret: 0, vol: 0, div: 0,
      tributacao: 'rf', isencao: false, carencia: 0, venceEm: 120,
      taxaAdm: 0, corretagem: 0, spread: 0, comeCotas: false, desagio: 0.94,
      risco: 'BAIXO', riscoCor: '#8fd47e', conceito: 'jurosReais',
      dica: 'Paga a inflação MAIS uma taxa fixa: é o único que garante ganho acima do custo de vida. Em troca, oscila no meio do caminho.',
    },
    {
      key: 'rf_pre', nome: 'TESOURO PREFIXADO', ticker: 'LTN 2029', categoria: 'rf',
      indexador: 'pre', fatorIndex: 1, taxaContratada: 0.114, duration: 4,
      fator: null, beta: 0, ret: 0, vol: 0, div: 0,
      tributacao: 'rf', isencao: false, carencia: 0, venceEm: 60,
      taxaAdm: 0, corretagem: 0, spread: 0, comeCotas: false, desagio: 0.96,
      risco: 'BAIXO', riscoCor: '#8fd47e', conceito: 'marcacaoMercado',
      dica: 'Você trava a taxa na compra. Se o juro subir depois, o preço CAI — e a perda só vira real se você vender antes do vencimento.',
    },
    {
      key: 'rf_cdb', nome: 'CDB 110% DO CDI', ticker: 'BANCO MÉDIO', categoria: 'rf',
      indexador: 'selic', fatorIndex: 1.1, taxaContratada: 0, duration: 0,
      fator: null, beta: 0, ret: 0, vol: 0, div: 0,
      tributacao: 'rf', isencao: false, carencia: 0, venceEm: 24,
      taxaAdm: 0, corretagem: 0, spread: 0, comeCotas: false, desagio: 0.98,
      risco: 'BAIXO', riscoCor: '#8fd47e', conceito: 'fgc',
      dica: 'Banco menor paga mais porque o risco é maior. O FGC cobre até R$ 250 mil por instituição — acima disso, o risco é seu.',
    },
    {
      key: 'rf_lci', nome: 'LCI/LCA 95% DO CDI', ticker: 'ISENTA DE IR', categoria: 'rf',
      indexador: 'selic', fatorIndex: 0.95, taxaContratada: 0, duration: 0,
      fator: null, beta: 0, ret: 0, vol: 0, div: 0,
      tributacao: 'isento', isencao: false, carencia: 3, venceEm: null,
      taxaAdm: 0, corretagem: 0, spread: 0, comeCotas: false, desagio: 0.97,
      risco: 'SEGURO', riscoCor: '#22d47e', conceito: 'isencaoIR',
      dica: 'Rende menos que o CDB no papel, mas não paga imposto nenhum — e no líquido costuma ganhar. O preço é a carência: 3 meses travada.',
    },

    // ---------- FUNDOS IMOBILIÁRIOS ----------
    {
      key: 'fii_tijolo', nome: 'FII DE TIJOLO', ticker: 'IFIX', categoria: 'fii',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'bolsaBR', beta: -2.5, ret: 0.004, vol: 0.035, div: 0.0075,
      tributacao: 'fii', isencao: false, carencia: 0, venceEm: null,
      taxaAdm: 0.01, corretagem: 5, spread: 0, comeCotas: false, desagio: 0.9,
      risco: 'MÉDIO', riscoCor: '#ffc24b', conceito: 'aluguelIsento',
      dica: 'Shoppings e galpões de verdade: o aluguel cai no seu caixa todo mês, isento de IR. Vacância e juro alto derrubam a cota.',
    },
    {
      key: 'fii_papel', nome: 'FII DE PAPEL', ticker: 'CRI / IPCA', categoria: 'fii',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'juros', beta: 1.5, ret: 0.002, vol: 0.02, div: 0.009,
      tributacao: 'fii', isencao: false, carencia: 0, venceEm: null,
      taxaAdm: 0.011, corretagem: 5, spread: 0, comeCotas: false, desagio: 0.92,
      risco: 'MÉDIO', riscoCor: '#ffc24b', conceito: 'aluguelIsento',
      dica: 'Não tem imóvel: tem dívida imobiliária indexada. Paga mais quando os juros e a inflação sobem — o oposto do tijolo.',
    },

    // ---------- AÇÕES BR ----------
    {
      key: 'ac_blue', nome: 'BLUE CHIPS', ticker: 'IBOV', categoria: 'acoes',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'bolsaBR', beta: -3, ret: 0.016, vol: 0.07, div: 0.005,
      tributacao: 'acoes', isencao: true, carencia: 0, venceEm: null,
      taxaAdm: 0, corretagem: 5, spread: 0, comeCotas: false, desagio: 0.9,
      risco: 'ALTO', riscoCor: '#ff9d4b', conceito: 'acoes',
      dica: 'As maiores empresas da bolsa. Caem 30% sem pedir licença — volatilidade só vira perda quando você é forçado a vender.',
    },
    {
      key: 'ac_small', nome: 'SMALL CAPS', ticker: 'SMLL', categoria: 'acoes',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'bolsaBR', beta: -6, ret: 0.022, vol: 0.11, div: 0.001,
      tributacao: 'acoes', isencao: true, carencia: 0, venceEm: null,
      taxaAdm: 0, corretagem: 5, spread: 0, comeCotas: false, desagio: 0.85,
      risco: 'ALTO', riscoCor: '#ff9d4b', conceito: 'acoes',
      dica: 'Empresas pequenas: crescem mais rápido e apanham muito mais de juro alto. É a bolsa com o volume no máximo.',
    },
    {
      key: 'ac_div', nome: 'AÇÕES DE DIVIDENDOS', ticker: 'IDIV', categoria: 'acoes',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'bolsaBR', beta: -1.5, ret: 0.010, vol: 0.055, div: 0.008,
      tributacao: 'acoes', isencao: true, carencia: 0, venceEm: null,
      taxaAdm: 0, corretagem: 5, spread: 0, comeCotas: false, desagio: 0.9,
      risco: 'MÉDIO', riscoCor: '#ffc24b', conceito: 'dividendos',
      dica: 'Empresas maduras que distribuem lucro em vez de crescer. Sobem menos, mas pingam renda no caixa todo mês.',
    },

    // ---------- INTERNACIONAL ----------
    {
      key: 'int_sp500', nome: 'S&P 500', ticker: 'ETF IVVB11', categoria: 'intl',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'intl', beta: -1, ret: 0.014, vol: 0.06, div: 0.001,
      tributacao: 'acoes', isencao: false, carencia: 0, venceEm: null,
      taxaAdm: 0.002, corretagem: 5, spread: 0, comeCotas: false, desagio: 0.92,
      risco: 'ALTO', riscoCor: '#ff9d4b', conceito: 'diversificacaoGeografica',
      dica: 'As 500 maiores dos EUA num papel só, em reais. ETF não tem a isenção de R$ 20 mil das ações brasileiras.',
    },
    {
      key: 'int_bdr', nome: 'BDR BIG TECH', ticker: 'BDRX', categoria: 'intl',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'intl', beta: -1.5, ret: 0.018, vol: 0.08, div: 0.001,
      tributacao: 'acoes', isencao: false, carencia: 0, venceEm: null,
      taxaAdm: 0, corretagem: 5, spread: 0, comeCotas: false, desagio: 0.9,
      risco: 'ALTO', riscoCor: '#ff9d4b', conceito: 'diversificacaoGeografica',
      dica: 'Recibo de ação estrangeira negociado aqui. Você compra a empresa E o dólar ao mesmo tempo.',
    },
    {
      key: 'int_ouro', nome: 'OURO', ticker: 'FUNDO GOLD', categoria: 'intl',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'intl', beta: 0, ret: 0.008, vol: 0.045, div: 0,
      tributacao: 'acoes', isencao: false, carencia: 0, venceEm: null,
      taxaAdm: 0.004, corretagem: 0, spread: 0, comeCotas: true, desagio: 0.95,
      risco: 'MÉDIO', riscoCor: '#ffc24b', conceito: 'comeCotas',
      dica: 'Não produz nada e não paga nada — só guarda valor quando o resto desaba. Via fundo, o IR é antecipado a cada semestre.',
    },

    // ---------- CRIPTO ----------
    {
      key: 'cr_btc', nome: 'BITCOIN', ticker: 'BTC', categoria: 'cripto',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'cripto', beta: -2, ret: 0.030, vol: 0.20, div: 0,
      tributacao: 'cripto', isencao: true, carencia: 0, venceEm: null,
      taxaAdm: 0, corretagem: 0, spread: 0.005, comeCotas: false, desagio: 0.85,
      risco: 'EXTREMO', riscoCor: '#ff4d5e', conceito: 'cripto',
      dica: 'Pode dobrar, pode derreter 45% num mês, e não paga renda nenhuma. Vendas até R$ 35 mil no mês são isentas.',
    },
    {
      key: 'cr_eth', nome: 'ETHEREUM', ticker: 'ETH', categoria: 'cripto',
      indexador: null, fatorIndex: 1, taxaContratada: 0, duration: 0,
      fator: 'cripto', beta: -2.5, ret: 0.032, vol: 0.26, div: 0,
      tributacao: 'cripto', isencao: true, carencia: 0, venceEm: null,
      taxaAdm: 0, corretagem: 0, spread: 0.005, comeCotas: false, desagio: 0.82,
      risco: 'EXTREMO', riscoCor: '#ff4d5e', conceito: 'cripto',
      dica: 'Anda colado no bitcoin e oscila ainda mais. Duas criptos na carteira não são diversificação: é a mesma aposta em dobro.',
    },
  ];

  /**
   * Ordem da liquidação forçada: do mais líquido/seguro ao mais caro de vender.
   * O deságio de cada um vem do próprio `desagio` da definição — diferente do
   * `config.liquidacao` dos modos antigos, que carrega o fator na tupla.
   */
  const ordemLiquidacao = [
    'rf_selic', 'rf_cdb', 'rf_pre', 'rf_ipca',
    'fii_papel', 'fii_tijolo',
    'ac_div', 'ac_blue', 'ac_small',
    'int_ouro', 'int_sp500', 'int_bdr',
    'cr_btc', 'cr_eth',
    // rf_lci fica FORA de propósito: está em carência/travada. Quem entra na
    // lista é resolvido em tempo de execução — ver realista.cobrir.
  ];

  /** @param {string} key */
  function def(key) {
    return defs.find(function (d) { return d.key === key; }) || null;
  }

  /** @param {string} categoria */
  function daCategoria(categoria) {
    return defs.filter(function (d) { return d.categoria === categoria; });
  }

  return { categorias, defs, ordemLiquidacao, def, daCategoria };
});
