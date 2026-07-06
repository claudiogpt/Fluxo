# Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"

Jogo de educação financeira por turnos: cada turno é um mês, o custo de vida drena o caixa, e o objetivo é fazer a renda passiva superar o custo de vida antes de falir.

## Propósito do jogo (nesta ordem)

1. **Ensinar finanças** — prioritário. Cada mecânica e evento deve deixar uma lição real de finanças pessoais/investimentos.
2. **Simulação** — secundário. A tendência é simular cada vez mais a realidade de investimentos, com decisões mais intricadas de tipos de investimento.
3. **Speedrun** — diversão/monetização. Timer, leaderboard e, futuramente, modo ranqueado com seed compartilhada.

Modos futuros planejados (já reservados no menu como "EM BREVE"): **Cenários** (crises/épocas reais pra atravessar, estilo Plague Inc) e **Speedrun ranqueado**.

## Como rodar

Abra a pasta no VSCode e suba o **Live Server** (ou qualquer servidor estático) e acesse `Simulador Financeiro.dc.html`. Precisa ser via HTTP — os componentes de tela são carregados por `fetch`, então abrir com duplo clique (`file://`) não funciona.

## Como testar

```bash
node --test
```

Sem dependências: só o Node embutido. Os testes cobrem as regras do jogo com aleatoriedade injetada (determinística).

## Arquitetura

Três camadas, acopladas só por contratos simples:

```
engine/  (regras puras)  →  Simulador Financeiro.dc.html  (orquestrador)  →  *.dc.html  (telas)
```

### `engine/` — regras do jogo, zero UI

Funções puras sobre um objeto de estado plano. Cada arquivo expõe um módulo em `window.Fluxo.*` no browser e via `module.exports` no Node (para os testes).

| Arquivo | Responsabilidade |
|---|---|
| `config.js` | Todo o balanceamento: dificuldades, inflação, chance de evento, ordem/deságios da liquidação forçada. |
| `ativos.js` | Definição dos 5 ativos (retorno, volatilidade, dividendo, risco, textos). |
| `eventos.js` | Tabela de eventos aleatórios com pesos + sorteio. |
| `regras.js` | O coração: `novoJogo`, `fecharMes` (resolve um turno), `mover` (aporte/resgate), `cobrir` (liquidação em cascata), `rendaPassiva`, `patrimonio`. |
| `formato.js` | `fmt` (R$), `fmtTempo`, `sparkline`. |
| `placar.js` | Leaderboard em `localStorage` (storage injetável nos testes). |

A aleatoriedade entra por parâmetro (`rng`), nunca por `Math.random` fixo — é isso que torna as regras testáveis.

### `Simulador Financeiro.dc.html` — orquestrador (entry point)

Único componente com estado. Guarda o estado do jogo, escuta teclado/timer, delega cada ação ao engine e converte o estado em view-model (`renderVals`) para as telas. Nenhuma regra de negócio aqui.

### Telas — componentes `*.dc.html` só-template

Recebem tudo por props (strings prontas, cores e callbacks); não têm estado nem lógica. O contrato de props está comentado no topo de cada arquivo.

| Componente | O que mostra |
|---|---|
| `Intro.dc.html` | Tela inicial com regras e botão de começar. |
| `PainelStatus.dc.html` | Cabeçalho, cards de indicadores e barra de progresso. |
| `AtivoCard.dc.html` | Um ativo com botões de aporte/resgate. |
| `TerminalEventos.dc.html` | Log de eventos do jogo. |
| `Leaderboard.dc.html` | Placar. |
| `FimDeJogo.dc.html` | Overlay de FALIU/LIVRE. |

**Dica de desenvolvimento ágil:** cada tela pode ser aberta sozinha no Live Server (ex.: `AtivoCard.dc.html`) — ela renderiza com dados de exemplo definidos no `data-props` do próprio arquivo. Dá pra ajustar o visual de uma tela sem rodar o jogo inteiro.

### Suporte

- `support.js` — runtime DC (gerado, **não editar**).
- `tema.css` — estilos globais compartilhados (fonte, fundo, animações `piscar`/`surgir`).

## Receitas rápidas

- **Mudar balanceamento** (dificuldade, inflação, deságios): `engine/config.js`.
- **Adicionar um modo de jogo**: entre em `engine/config.js` (`modos`) com `disponivel: false` — ele já aparece no menu como "EM BREVE". Quando a mecânica existir, ligue `disponivel: true` e trate o `state.modo` no orquestrador/engine.
- **Adicionar um ativo**: acrescente em `engine/ativos.js` (e na ordem de liquidação em `config.js` se quiser que ele cubra déficit). A UI o exibe automaticamente.
- **Adicionar um evento aleatório**: acrescente um item com peso `p` e `run` em `engine/eventos.js`.
- **Mexer no visual de uma tela**: edite o `*.dc.html` correspondente e abra-o isolado no Live Server.
- **Nova regra de turno**: `engine/regras.js` (`fecharMes`) + um teste em `tests/engine.test.js`.
