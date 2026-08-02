// MANUAL: referência do jogo, sempre disponível e sem desbloqueio.
//
// É o tutorial de quem prefere ler a ser guiado — por isso nada aqui depende de
// progresso. Cada seção declara em que telas o `?` deve abri-la direto.
//
// Regra de conteúdo: descreve o que o jogo FAZ, com os números de
// engine/config.js e engine/regras.js. Mudou balanceamento, muda aqui.

import type { SecaoManual } from './tipos';

export const MANUAL: readonly SecaoManual[] = [
  {
    id: 'regras',
    titulo: 'COMO O MÊS FECHA',
    resumo: 'o loop do turno, a derrota e a vitória',
    contextos: ['jogo', 'menu'],
    chamada:
      'Sete passos, sempre na mesma ordem. Você só decide o passo zero: onde o dinheiro está.',
    // Os únicos números de ENTRA/SAI do manual, porque é a única seção que
    // descreve mesmo dinheiro entrando e saindo todo mês. As porcentagens são
    // as do `normal` em engine/config.js — mudou balanceamento, muda aqui.
    numeros: {
      entra: [
        { rotulo: 'Salário', valor: '+10% a cada 12 meses', tom: 'alta' },
        { rotulo: 'Retorno dos ativos', valor: 'varia por classe' },
        { rotulo: 'Renda passiva', valor: 'só quem paga' },
      ],
      sai: [
        { rotulo: 'Custo de vida', valor: '+0,4%/mês', tom: 'baixa' },
        { rotulo: 'Eventos', valor: '42% dos meses', tom: 'baixa' },
        { rotulo: 'Deságio de liquidação', valor: 'por classe', tom: 'baixa' },
      ],
    },
    // As duas saídas saíram da prosa e viraram DADO: eram dois parágrafos em
    // negrito no corpo, e mantê-los nos dois lugares faria o verbete dizer a
    // mesma coisa duas vezes na mesma tela.
    desfechos: {
      derrota: {
        palavra: 'FALIU',
        texto: 'O caixa fechou negativo e não havia mais nada pra vender.',
      },
      vitoria: {
        palavra: 'LIVRE',
        texto:
          'Renda passiva mensal ≥ custo de vida. É renda passiva, não patrimônio: ativo grande parado que não paga nada não te liberta.',
      },
    },
    corpo: `Cada turno é um mês. Fechar o mês executa sempre a mesma sequência, nesta ordem.

- **Salário entra, custo de vida sai.** O que sobra vira caixa parado — caixa
  parado não rende nada.
- **Os ativos se mexem.** Cada classe sorteia seu retorno do mês em torno da
  média dela, com o tamanho de oscilação que lhe é próprio.
- **A renda passiva cai no caixa.** Só ativos que pagam renda contribuem.
- **Pode acontecer um evento.** A partir do mês 3, todo mês tem chance de vir um
  imprevisto — no normal, um pouco menos da metade dos meses.
- **A inflação corrói.** Seu custo de vida sobe cerca de 0,4% por mês no normal e
  0,5% no hardcore. Ele nunca desce.
- **A cada 12 meses, progressão de carreira.** O salário sobe 10% — desde que
  você ainda tenha salário.
- **Se o caixa fechou negativo, o jogo vende por você.** É a liquidação forçada,
  na ordem reserva → renda fixa → FIIs → ações → cripto, cada uma com seu
  deságio.

O custo de vida sobe todo mês. A meta se move junto — é de propósito.`,
  },

  {
    id: 'modos',
    titulo: 'MODOS DE JOGO',
    resumo: 'o que muda entre tutorial, clássico, sandbox, empresário e realista',
    contextos: ['modos', 'setup'],
    chamada:
      'As regras acima valem em todos. O que muda de modo pra modo é quanta margem você tem pra errar.',
    corpo: `## TUTORIAL

Seis meses, prazo declarado, sem derrota possível. É o clássico com as arestas
tiradas: dificuldade normal, e o mês seis encerra a partida do mesmo jeito que
qualquer outro fim. Não pontua no placar e não é pré-requisito de nada — se você
preferir aprender jogando de verdade, pule.

## CLÁSSICO

Do zero à liberdade. Salário, custo de vida, cinco classes de ativo e as duas
saídas: FALIU ou LIVRE. É o modo em que as regras acima valem sem exceção.

Em **hardcore** você começa com metade do caixa, o custo de vida pesa mais, os
eventos aparecem com mais frequência e a inflação é maior. Mesmas regras, menos
margem.

## SANDBOX

O clássico sem derrota e sem encerramento: caixa negativo vira aviso no terminal
em vez de fim de jogo, e a partida não acaba quando sua renda passiva paga a
conta — só registra o marco. Você escolhe o capital inicial. Serve pra testar
estratégia, não pra pontuar sob pressão.

## EMPRESÁRIO

Não existe salário: quem paga sua vida é o negócio. Ele tem receita variável e
custo fixo próprios, e o dinheiro dele **não é o seu bolso** — passar valor de um
lado pro outro é uma decisão explícita.

A cada melhoria a receita sobe, mas cada melhoria seguinte rende menos que a
anterior. Três meses consecutivos no vermelho e a empresa fecha.

## REALISTA

O carro-chefe, e o que mais muda de regra:

- **15 papéis em 5 categorias**, em vez de 5 classes genéricas. Cada papel tem
  indexador, prazo, tributação e custos próprios.
- **Imposto de renda de verdade.** Renda fixa segue a tabela regressiva: 22,5%
  até 6 meses, 20% até 12, 17,5% até 24 e 15% depois disso. Ações e cripto pagam
  15%, FIIs pagam 20% na venda.
- **Isenções.** Vendas de até R$ 20 mil por mês em ações não pagam imposto, e o
  rendimento mensal de FII entra isento. Papéis isentos rendem menos no papel e
  ganham no líquido.
- **Liquidez.** Alguns papéis travam por um tempo depois da compra, e outros têm
  data de vencimento.
- **Marcação a mercado.** Prefixados e IPCA+ mudam de preço quando o juro se
  mexe. Só vira perda se você vender antes do vencimento.
- **A macro é viva.** A Selic caminha em direção a um alvo, com ruído, e os
  eventos de COPOM movem o alvo — por isso um choque de juros dura meses.
- **Custos aparecem na conta.** Taxa de administração, corretagem, spread e
  come-cotas são cobrados e ficam registrados.`,
  },

  {
    id: 'cenarios',
    titulo: 'CENÁRIOS',
    resumo: 'situações fechadas, com começo e fim definidos',
    contextos: ['cenarios'],
    chamada:
      'Uma pergunta de cada vez, com prazo e critério de fim — e sem resposta universal no fim dela.',
    corpo: `Cenário não é modo: é uma situação com enunciado, duração e critério de fim.

## APOSENTADORIA

São 36 meses acumulando com salário e, depois, 48 meses vivendo só do patrimônio.
No mês 37 o salário some e o jogo passa a vender ativos todo mês pra pagar seu
custo de vida.

Você escolhe como sacar: o **valor do seu custo de vida** (que segue inflacionando)
ou um **percentual do patrimônio** por mês. O primeiro protege seu padrão de vida
e ataca o patrimônio; o segundo faz o contrário.

Vence quem atravessa os 48 meses de saque. Perde quem fica sem patrimônio antes —
ou quem quebra ainda na acumulação.

## IMÓVEIS

Comprar financiado ou alugar e investir a diferença, por 48 meses. Comprando, a
entrada sai do seu capital e a parcela sai todo mês; alugando, o aluguel sai todo
mês e o dinheiro da entrada fica investido.

Aqui o custo de vida exclui moradia de propósito — moradia é justamente a decisão
do cenário. No fim, as duas estratégias aparecem lado a lado.

Não existe resposta universal: o resultado depende da sequência de mercado que a
sua partida sorteou. É exatamente esse o ponto.

## TREINO

A faixa de baixo da mesma tela. Mecanicamente é um cenário como os outros: o que
muda é que você **começa numa posição ruim de propósito**, com carteira montada,
e os eventos difíceis vêm em meses marcados — não sorteados. O objetivo é fechado
e curto: atravessar N meses.

Serve pra treinar a decisão que você errou, quantas vezes quiser, sem esperar o
azar acontecer de novo numa partida longa. Cada treino aponta o estudo que ele
treina.`,
  },

  {
    id: 'atalhos',
    titulo: 'ATALHOS DE TECLADO',
    resumo: 'jogar sem tirar a mão do teclado',
    contextos: ['jogo', 'menu', 'biblioteca', 'config'],
    chamada: 'Nenhum atalho é obrigatório: tudo aqui também tem botão ou linha clicável.',
    corpo: `## Em qualquer tela

- **?** — abre este manual na seção que responde pela tela em que você está
- **G** — abre e fecha a biblioteca

## Durante a partida

- **Espaço** — fecha o mês
- **A** — liga e desliga o avanço automático
- **L** — lê o estudo que estiver sendo oferecido: a linha do rodapé durante o
  mês, o diagnóstico depois do fim

## Dentro da biblioteca

- **1**, **2**, **3** — glossário, manual, fundamentos
- **Esc** — volta um nível: do estudo pra lista, da lista pro jogo

## Nos avisos de primeira vez

- **Espaço** ou **Enter** — entendi (e confirma a ação, quando havia uma)
- **Esc** — cancela a ação que estava pendente

## No menu

- **T** e **X** — jogar o tutorial ou dispensar o convite, quando ele aparece
- **Esc** — volta uma tela

Nenhum atalho é obrigatório: tudo tem botão ou linha clicável.`,
  },
];

export const secaoManual = (id: string): SecaoManual | null =>
  MANUAL.find((s) => s.id === id) ?? null;
