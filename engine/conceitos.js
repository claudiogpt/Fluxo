// Dicionário central de conceitos educacionais.
// `termos` alimenta o glossário; `tooltips` liga ações do jogo a conceitos
// (cada tooltip visto desbloqueia seus termos no glossário).
// Adicionar conceito novo = adicionar entrada aqui; a lógica do jogo não muda.
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

  function storagePadrao() {
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
  }

  function vistos(storage) {
    const st = storage || storagePadrao();
    try { return JSON.parse((st && st.getItem(CHAVE)) || '[]'); } catch (e) { return []; }
  }

  function jaVisto(id, storage) {
    return vistos(storage).includes(id);
  }

  function marcarVisto(id, storage) {
    const st = storage || storagePadrao();
    if (!st) return;
    const v = vistos(storage);
    if (v.includes(id)) return;
    v.push(id);
    try { st.setItem(CHAVE, JSON.stringify(v)); } catch (e) { /* sem storage */ }
  }

  // Termos desbloqueados = os de curiosidade (`sempre`) + a união dos termos
  // dos tooltips já vistos.
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
