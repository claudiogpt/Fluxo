// Catálogo de gatilhos: os eventos de jogo que destravam conteúdo.
//
// Por que existe, se o engine já destrava termos sozinho: o engine liga
// TOOLTIP VISTO → TERMOS que ele cita (conceitos.termosDesbloqueados). Isso
// cobre o glossário, mas dois buracos sobram:
//   1. o evento não tinha nome legível em lugar nenhum — "acoes" é chave, não
//      frase; a biblioteca precisa dizer o que falta fazer pra destravar;
//   2. estudo e derrota não têm tooltip (ninguém abre modal ao falir).
// Então: id de gatilho COM tooltip = mesmo id do tooltip, sempre. Nada de
// tabela de conversão.
//
// A divisão que importa:
//   COM tooltip  → o modal educacional já ensina na hora. Não ganha `licao`:
//                  duas frases sobre a mesma cena seriam conteúdo duplicado.
//   SEM tooltip  → ninguém abre modal ao fechar o mês no vermelho. Estes
//                  ganham `licao` (a linha do rodapé) e `termos` (o que
//                  destravam no glossário, já que não há tooltip citando).

import type { Gatilho } from './tipos';

type Def = Omit<Gatilho, 'id'>;

const defs = {
  // --- gatilhos que já existem no engine (id == id do tooltip) ---
  reserva: { descricao: 'primeiro aporte na reserva de emergência' },
  acoes: { descricao: 'primeira alocação em ações' },
  cripto: { descricao: 'primeira alocação em cripto' },
  posFixado: { descricao: 'primeira compra de um papel pós-fixado' },
  marcacaoMercado: { descricao: 'primeira compra de um prefixado' },
  jurosReais: { descricao: 'primeira compra de um IPCA+' },
  fgc: { descricao: 'primeira compra de um papel de banco médio' },
  isencaoIR: { descricao: 'primeira compra de um papel isento de IR' },
  comeCotas: { descricao: 'primeira compra de um fundo com come-cotas' },
  aluguelIsento: { descricao: 'primeira compra de um FII' },
  diversificacaoGeografica: { descricao: 'primeira compra de um ativo internacional' },
  dividendos: { descricao: 'primeira compra de uma pagadora de dividendos' },
  diversificacao: { descricao: 'carteira chega a três classes de ativo' },
  moradia: { descricao: 'início do cenário imóveis' },
  sequencia: { descricao: 'começo da fase de saque na aposentadoria' },
  liquidacaoForcada: { descricao: 'o jogo vende seus ativos à força pra cobrir o mês' },

  // --- gatilhos sem tooltip: linha no rodapé, nunca modal ---
  despesaInesperada: {
    descricao: 'um imprevisto cobra uma despesa do seu caixa',
    licao: 'Imprevisto não avisa e não escolhe o mês. Reserva existe pra ele sair do caixa, não da carteira.',
  },
  saldoNegativo: {
    descricao: 'fechar um mês com o caixa no vermelho',
    licao: 'Caixa no vermelho é o começo da venda forçada: daqui pra frente quem escolhe o que vender é a urgência.',
  },
  inflacaoComeSalario: {
    descricao: 'o custo de vida passa a ser maior que o salário',
    licao: 'Seu custo de vida subiu acima do salário. É por isso que rendimento nominal não diz nada sozinho.',
    termos: ['jurosReais'],
  },

  // --- fim de partida: alimentam o diagnóstico da derrota, sem rodapé ---
  falencia: { descricao: 'terminar a partida FALIU' },
  aposentadoriaEsgotada: { descricao: 'o patrimônio acaba antes dos meses de saque' },
} satisfies Record<string, Def>;

export type GatilhoId = keyof typeof defs;

export const GATILHOS: Record<GatilhoId, Gatilho> = Object.fromEntries(
  Object.entries(defs).map(([id, def]) => [id, { id, ...def }])
) as Record<GatilhoId, Gatilho>;

export const gatilho = (id: string): Gatilho | null =>
  (GATILHOS as Record<string, Gatilho>)[id] ?? null;

/** Os que mostram linha no rodapé quando acontecem pela primeira vez. */
export const GATILHOS_COM_LICAO: Gatilho[] = Object.values(GATILHOS).filter((g) => g.licao);
