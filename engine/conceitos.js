/**
 * @file Dicionário central de conceitos educacionais.
 * `termos` alimenta o glossário; `tooltips` liga ações do jogo a conceitos.
 * Adicionar conceito novo = entrada aqui; a lógica do jogo não muda.
 * @typedef {import('./typedefs.jsdoc').StorageLike} StorageLike
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else { root.Fluxo = root.Fluxo || {}; root.Fluxo.conceitos = factory(); }
})(typeof window !== 'undefined' ? window : globalThis, function () {

  const CHAVE = 'fluxo_conceitos_v1';

  // Glossário: id → { nome, definicao, sempre? }
  // `sempre: true` = curiosidade, já nasce desbloqueada (não depende de tooltip).
  const termos = {
    peculium: {
      nome: 'Peculium',
      sempre: true,
      definicao: 'Do latim pecus, "gado" — a forma mais antiga de riqueza, e a mesma raiz de "pecúlio" e "pecuniário". No direito romano, o peculium era o patrimônio que alguém sob o poder de outro (um filho, ou uma pessoa escravizada) podia acumular e administrar: no papel pertencia ao senhor, mas na prática crescia nas mãos de quem o gerava — e podia ser usado para comprar a própria alforria. Daí o nome deste jogo: juntar, administrar e converter em liberdade.',
    },
    marcacaoMercado: { nome: 'Marcação a mercado', definicao: 'O preço pelo qual você conseguiria VENDER hoje um título que só vence lá na frente. Se o juro do país sobe depois da sua compra, títulos antigos pagando menos valem menos — e quanto mais longo o papel, maior a queda. Segurando até o vencimento, você recebe a taxa contratada e nada disso importou.' },
    jurosReais: { nome: 'Juro real', definicao: 'O que sobra do rendimento depois de descontar a inflação. Render 13% num ano de inflação de 10% não é ganhar 13%: é ganhar cerca de 2,7%. É o único número que diz se seu poder de compra cresceu.' },
    posFixado: { nome: 'Pós-fixado × prefixado', definicao: 'Pós-fixado acompanha a taxa do dia (Selic/CDI) e não oscila de preço — é onde a reserva mora. Prefixado trava a taxa hoje: você ganha se o juro cair, e perde se subir. São apostas opostas sobre o mesmo futuro.' },
    fgc: { nome: 'FGC', definicao: 'Fundo Garantidor de Créditos: devolve até R$ 250 mil por CPF e por instituição se o banco quebrar. É por isso que banco pequeno paga mais que banco grande — e por isso concentrar acima do teto é assumir risco de crédito sem receber por ele.' },
    isencaoIR: { nome: 'Isenção de IR', definicao: 'LCI, LCA, aluguel de FII e vendas de até R$ 20 mil/mês em ações não pagam imposto. Comparar rendimento BRUTO de um isento com um tributado é o erro mais caro da renda fixa: 95% do CDI isento costuma bater 110% do CDI tributado.' },
    comeCotas: { nome: 'Come-cotas', definicao: 'A cada semestre, alguns fundos entregam sozinhos parte do seu lucro à Receita, em maio e novembro. Você não faz nada e não escolhe a hora: some cota. Antecipar imposto corta juros compostos, porque o dinheiro do Leão para de render pra você.' },
    aluguelIsento: { nome: 'Renda de FII', definicao: 'O rendimento mensal do FII cai no seu caixa isento de IR — mas a VENDA da cota paga 20%, sem a isenção que as ações têm. E aluguel não é garantido: galpão vazio não paga nada.' },
    diversificacaoGeografica: { nome: 'Diversificação geográfica', definicao: 'Ter parte do patrimônio fora do país. Quando o Brasil vai mal, o dólar costuma subir e o ativo internacional amortece a queda — é defesa contra o risco de morar num país só, não aposta em país melhor.' },
    dividendos: { nome: 'Dividendos', definicao: 'Parte do lucro que a empresa distribui em dinheiro, em vez de reinvestir. Empresas maduras pagam mais e crescem menos; empresas em expansão fazem o contrário. Nenhum dos dois é melhor — são fases diferentes.' },
    cdi: { nome: 'CDI', definicao: 'A taxa que os bancos usam pra emprestar dinheiro entre si por um dia. É o "piso" da renda fixa brasileira: render "100% do CDI" significa acompanhar essa taxa.' },
    selic: { nome: 'Selic', definicao: 'A taxa básica de juros do Brasil, definida pelo Banco Central. Ela puxa o CDI, o rendimento da reserva e o custo de todo crédito do país.' },
    diversificacao: { nome: 'Diversificação', definicao: 'Espalhar o dinheiro entre ativos que não caem juntos. Não é sobre ganhar mais: é sobre nunca ser nocauteado por um golpe só.' },
    correlacao: { nome: 'Correlação entre ativos', definicao: 'O quanto dois ativos se movem juntos. Diversificar entre ativos que caem juntos é ilusão de segurança.' },
    custoOportunidade: { nome: 'Custo de oportunidade', definicao: 'O que seu dinheiro deixaria de render na melhor alternativa. Todo "sim" financeiro é um "não" pra outra coisa.' },
    volatilidade: { nome: 'Volatilidade', definicao: 'O tamanho do sobe-e-desce de um ativo. Não é sinônimo de perda — vira perda quando você é forçado a vender na baixa.' },
    marginCall: { nome: 'Margin call', definicao: 'Quando o corretor liquida suas posições à força porque a garantia acabou. O primo cotidiano dele é vender às pressas pra pagar boleto.' },
    sequenciaRetornos: { nome: 'Risco de sequência de retornos', definicao: 'Mesma média de retorno, ordens diferentes: anos ruins no INÍCIO da fase de saque machucam mais, porque cada saque vende na baixa.' },
  };

  // Tooltips: id do gatilho → { titulo, explicacao (2–4 frases), termos: [ids do glossário] }
  const tooltips = {
    reserva: {
      titulo: 'RESERVA DE EMERGÊNCIA',
      explicacao: 'A reserva rende ~100% do CDI, que anda colado na Selic. Parece pouco perto de ações e cripto — mas o trabalho dela não é te enriquecer: é impedir que uma emergência te force a vender investimento bom na hora ruim.',
      termos: ['cdi', 'selic'],
    },
    acoes: {
      titulo: 'AÇÕES = VOLATILIDADE',
      explicacao: 'Ações têm o maior potencial de crescimento do jogo, mas caem 30% sem pedir licença. Volatilidade não é perda — vira perda quando você é FORÇADO a vender na baixa. Invista aqui o que pode esperar.',
      termos: ['volatilidade'],
    },
    cripto: {
      titulo: 'CRIPTO = VOLATILIDADE EXTREMA',
      explicacao: 'Pode dobrar, pode derreter 45% num mês — e não paga nenhuma renda passiva. Regra de sobrevivência: cripto é tempero, não prato principal.',
      termos: ['volatilidade'],
    },
    posFixado: {
      titulo: 'ONDE A RESERVA MORA',
      explicacao: 'O pós-fixado acompanha a Selic todo dia e não perde valor se você sair antes — é o único da renda fixa sem marcação a mercado. Rende menos que os outros quando o juro cai, e é exatamente por isso que ele é o lugar do dinheiro que você pode precisar amanhã.',
      termos: ['posFixado', 'selic'],
    },
    dividendos: {
      titulo: 'LUCRO NO BOLSO, CRESCIMENTO NO FUTURO',
      explicacao: 'Empresa madura distribui lucro e cresce devagar; empresa em expansão reinveste tudo e não paga nada. Dividendo é renda passiva de verdade, mas trocar crescimento por renda cedo demais custa caro no fim.',
      termos: ['dividendos', 'custoOportunidade'],
    },
    marcacaoMercado: {
      titulo: 'PREFIXADO = APOSTA EM JURO',
      explicacao: 'Você está travando uma taxa por anos. Se a Selic subir depois, o preço deste papel CAI — e quanto mais longo, mais dói. A perda só vira real se você vender antes do vencimento; segurando até o fim, recebe exatamente o contratado.',
      termos: ['marcacaoMercado', 'posFixado'],
    },
    jurosReais: {
      titulo: 'O ÚNICO QUE GARANTE GANHO REAL',
      explicacao: 'IPCA+ paga a inflação MAIS uma taxa fixa: seu poder de compra cresce faça o que fizer o custo de vida. Em troca ele é longo, e oscila bastante no meio do caminho quando o juro real se mexe.',
      termos: ['jurosReais', 'marcacaoMercado'],
    },
    fgc: {
      titulo: 'BANCO MENOR PAGA MAIS PORQUE ARRISCA MAIS',
      explicacao: 'O FGC devolve até R$ 250 mil por instituição se o banco quebrar. Dentro do teto, o rendimento maior é quase de graça. Acima dele, você está emprestando dinheiro a um banco pequeno sem garantia nenhuma.',
      termos: ['fgc'],
    },
    isencaoIR: {
      titulo: 'BRUTO NÃO É LÍQUIDO',
      explicacao: 'A LCI rende menos no papel e ainda trava por 3 meses — mas não paga um centavo de imposto. Compare sempre o LÍQUIDO: 95% do CDI isento costuma ganhar de 110% do CDI tributado. O preço é a liquidez.',
      termos: ['isencaoIR'],
    },
    comeCotas: {
      titulo: 'O IMPOSTO QUE CHEGA SEM AVISO',
      explicacao: 'Alguns fundos antecipam IR a cada semestre, comendo cotas sem você fazer nada. Não é imposto novo — é o mesmo, cobrado antes. E cobrado antes significa menos dinheiro rendendo por você nos anos seguintes.',
      termos: ['comeCotas'],
    },
    aluguelIsento: {
      titulo: 'ALUGUEL SEM SÍNDICO — MAS SEM GARANTIA',
      explicacao: 'O rendimento mensal cai no caixa isento de IR, e é a renda passiva mais direta do jogo. Só que a cota oscila como ação, a venda paga 20% e galpão vazio não paga aluguel nenhum.',
      termos: ['aluguelIsento', 'isencaoIR'],
    },
    diversificacaoGeografica: {
      titulo: 'RISCO DE MORAR NUM PAÍS SÓ',
      explicacao: 'Ter tudo em Brasil é apostar num único governo, uma única moeda e uma única bolsa. Quando o país vai mal, o dólar sobe e a parte internacional segura a queda. ETF e BDR, porém, não têm a isenção de R$ 20 mil das ações brasileiras.',
      termos: ['diversificacaoGeografica', 'correlacao'],
    },
    diversificacao: {
      titulo: 'VOCÊ DIVERSIFICOU',
      explicacao: 'Com 3+ classes na carteira, um crash sozinho não te nocauteia mais. Só cuidado com a correlação: ações e FIIs costumam cair juntos — reserva e renda fixa são o amortecedor.',
      termos: ['diversificacao', 'correlacao'],
    },
    moradia: {
      titulo: 'CUSTO DE OPORTUNIDADE',
      explicacao: 'Cada real de entrada e parcela é um real que não compõe juros na carteira — e cada aluguel pago não vira tijolo. Não há resposta universal: a corrida deste cenário mostra o que a SUA sequência de mercado decidiu.',
      termos: ['custoOportunidade'],
    },
    sequencia: {
      titulo: 'RISCO DE SEQUÊNCIA DE RETORNOS',
      explicacao: 'A partir de agora você vende ativos todo mês pra viver. Se os primeiros meses forem de baixa, você vende barato e o buraco não fecha mais — mesma média, ordem diferente, destino diferente.',
      termos: ['sequenciaRetornos'],
    },
    liquidacaoForcada: {
      titulo: 'VENDA FORÇADA',
      explicacao: 'Faltou caixa e o jogo vendeu seus ativos com deságio — o mesmo mecanismo do margin call: quem decide o preço é a urgência, não você. Reserva de emergência existe pra essa cena nunca acontecer.',
      termos: ['marginCall'],
    },
  };

  /** @returns {StorageLike|null} Browser localStorage or null if unavailable. */
  function storagePadrao() {
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
  }

  /**
   * Lista ids de conceitos/tooltips já vistos pelo jogador.
   *
   * @param {StorageLike|null} [storage] - Injectable storage.
   * @returns {string[]} Seen concept ids.
   */
  function vistos(storage) {
    const st = storage || storagePadrao();
    try { return JSON.parse((st && st.getItem(CHAVE)) || '[]'); } catch (e) { return []; }
  }

  /**
   * Verifica se um conceito ou tooltip já foi visto.
   *
   * @param {string} id - Concept or tooltip id.
   * @param {StorageLike|null} [storage] - Injectable storage.
   * @returns {boolean} True if already seen.
   */
  function jaVisto(id, storage) {
    return vistos(storage).includes(id);
  }

  /**
   * Marca conceito como visto e persiste no storage.
   *
   * @param {string} id - Concept or tooltip id.
   * @param {StorageLike|null} [storage] - Injectable storage.
   */
  function marcarVisto(id, storage) {
    const st = storage || storagePadrao();
    if (!st) return;
    const v = vistos(storage);
    if (v.includes(id)) return;
    v.push(id);
    try { st.setItem(CHAVE, JSON.stringify(v)); } catch (e) { /* sem storage */ }
  }

  /**
   * Retorna ids de termos do glossário desbloqueados.
   *
   * Inclui termos `sempre: true` mais termos ligados aos tooltips já vistos.
   *
   * @param {StorageLike|null} [storage] - Injectable storage.
   * @returns {string[]} Unlocked glossary term ids.
   */
  function termosDesbloqueados(storage) {
    const lista = Object.keys(termos).filter(function (id) { return termos[id].sempre; });
    for (const id of vistos(storage)) {
      const t = tooltips[id];
      if (!t) continue;
      for (const termo of t.termos) if (!lista.includes(termo)) lista.push(termo);
    }
    return lista;
  }

  return { CHAVE, termos, tooltips, vistos, jaVisto, marcarVisto, termosDesbloqueados };
});
