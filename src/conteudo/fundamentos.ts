// FUNDAMENTOS: como aquilo que aconteceu na partida funciona fora do jogo.
//
// Regra de conteúdo: nenhum número inventado. Quando o texto quantifica algo,
// o número vem de engine/config.js (deságios da liquidação forçada, meses do
// cenário aposentadoria, tabela regressiva de IR) — se o balanceamento mudar
// lá, este texto tem que mudar junto, e o teste de integridade cobra isso.
//
// Nenhum estudo repete a definição de um termo: para isso existe o glossário,
// e o rodapé liga de volta pra lá.

import type { Estudo } from './tipos';

export const ESTUDOS: readonly Estudo[] = [
  {
    id: 'sequencia-de-retornos',
    titulo: 'A ordem dos anos importa mais que a média',
    tempoLeituraMin: 4,
    gatilho: 'sequencia',
    conceitoPrincipal: 'sequenciaRetornos',
    conceitosRelacionados: ['volatilidade', 'diversificacao', 'custoOportunidade'],
    corpo: `Duas carteiras podem render exatamente a mesma média em dez anos e terminar
com saldos muito diferentes. A diferença não está em quanto renderam: está em
quando renderam.

## Enquanto você só deposita, a ordem não importa

Se você não tira dinheiro, tanto faz se o ano ruim veio primeiro ou por último:
multiplicação é comutativa. Cair 20% e depois subir 30% dá o mesmo resultado que
subir 30% e depois cair 20%. É por isso que quem está acumulando pode olhar para
uma queda como preço de entrada, e não como estrago.

## Quando você começa a sacar, a ordem passa a ser tudo

O saque quebra a comutatividade. Cada retirada feita num mês de baixa vende mais
cotas para entregar o mesmo dinheiro — e essas cotas não voltam para a recuperação
depois. O patrimônio some por dois caminhos ao mesmo tempo: o mercado tira uma
parte e o saque tira a outra, do que sobrou.

Duas sequências com a mesma média, a mesma carteira e o mesmo saque podem
terminar uma com dinheiro sobrando e a outra em zero. O que separou as duas foi
apenas em que ordem os anos ruins apareceram.

## As três defesas conhecidas

- **Caixa que não oscila.** Manter alguns meses de saque em algo que não cai
  permite atravessar a baixa sem vender o que caiu.
- **Sacar de outra caixa.** Quando uma classe está no vermelho, a retirada sai de
  outra — é para isso que serve ter classes que não caem juntas.
- **Saque flexível.** Retirada calculada como percentual do patrimônio encolhe
  junto com ele; retirada fixa, não. A fixa protege seu padrão de vida no curto
  prazo e ataca o patrimônio no longo.

Nenhuma das três aumenta o retorno médio. As três atacam a mesma coisa: a chance
de você ser obrigado a vender barato.

## Por que isso é discutido justamente na aposentadoria

Porque é o momento em que a maioria das pessoas passa, de uma vez, de depositante
a sacador — e leva para a fase de saque uma carteira montada com a lógica da fase
de acumulação. O risco não mudou de tamanho; mudou de consequência.`,
    ondeApareceNoJogo: `No cenário APOSENTADORIA. São 36 meses acumulando e 48 meses vivendo do
patrimônio: no mês 37 o jogo troca de fase e passa a vender ativos todo mês pra
pagar seu custo de vida. Se os primeiros meses de saque forem de queda, o buraco
que abrir ali dificilmente fecha nos 48.`,
  },

  {
    id: 'liquidez-e-venda-forcada',
    titulo: 'Volatilidade não é perda. Venda forçada é.',
    tempoLeituraMin: 3,
    gatilho: 'liquidacaoForcada',
    conceitoPrincipal: 'marginCall',
    conceitosRelacionados: ['volatilidade', 'cdi', 'selic', 'posFixado'],
    corpo: `Um ativo que caiu 30% não te causou prejuízo nenhum enquanto você não vendeu.
O prejuízo nasce no instante em que alguém precisa do dinheiro e a única saída é
aceitar o preço do dia. A queda é uma condição do mercado; a venda é uma decisão
sua — exceto quando deixa de ser.

## Quem decide o preço é a urgência

Quando falta caixa, a ordem de venda não é escolhida: é imposta. No mercado
alavancado isso tem nome e telefonema — o corretor liquida a posição porque a
garantia acabou. Na vida sem alavancagem nenhuma, a mesma cena acontece com outro
nome: vender investimento às pressas pra pagar boleto.

O mecanismo é idêntico nos dois casos. Você entra no mercado como vendedor
obrigado, num dia que você não escolheu, por um preço que você não negocia.

## O deságio tem tabela

Este jogo cobra a pressa explicitamente. Quando o caixa fecha negativo, ele
liquida na seguinte ordem, e cada linha tem seu preço:

- reserva de emergência: **sem perda**
- renda fixa: **2% de deságio**
- FIIs: **10%**
- ações: **10%**
- cripto: **15%**

Fora do jogo ninguém publica essa tabela, mas ela existe do mesmo jeito: aparece
como spread mais largo, como cota vendida no pior dia do mês, como imposto pago
antes da hora, como multa de resgate antecipado.

## Por que o pós-fixado existe

Existe um tipo de aplicação cujo trabalho não é render muito: é não cair e estar
disponível amanhã. Ela acompanha a taxa básica de juros do dia, então não sofre
marcação a mercado — sair antes não custa desconto.

Comparar o retorno dela com o de ações é comparar coisas que fazem trabalhos
diferentes. O retorno da reserva não é o que ela rende: é o deságio de 10% ou 15%
que você não precisou pagar.

## O tamanho certo

A pergunta não é "quantos meses de salário", e sim quantos meses o seu caixa
aguenta se a receita parar — o que depende de quão estável é essa receita e de
quanto do seu custo é fixo. Quem tem renda irregular precisa de mais reserva
exatamente porque tem mais chance de virar vendedor obrigado.`,
    ondeApareceNoJogo: `Toda vez que o terminal diz "vendidos às pressas" ou "liquidada na marra". O
jogo já tinha te cobrado o deságio quando essa linha apareceu — e a reserva é a
única linha da tabela que sai por 100% do valor.`,
  },
];

export const estudo = (id: string): Estudo | null => ESTUDOS.find((e) => e.id === id) ?? null;
