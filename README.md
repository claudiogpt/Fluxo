# Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"

Jogo de educação financeira por turnos: cada turno é um mês, o custo de vida drena o caixa, e o objetivo é fazer a renda passiva superar o custo de vida antes de falir.

## Propósito do jogo (nesta ordem)

1. **Ensinar finanças** — prioritário. Cada mecânica e evento deve deixar uma lição real de finanças pessoais/investimentos.
2. **Simulação** — secundário. A tendência é simular cada vez mais a realidade de investimentos, com decisões mais intricadas de tipos de investimento.
3. **Speedrun** — diversão/monetização. Timer e placar global em **todos os modos**. Sem seed compartilhada, de propósito: o jogo é não determinístico e a sorte (e jogar de novo) faz parte da corrida.

## Como rodar

```bash
npm install
npm run dev        # Vite em http://localhost:5173
```

## Como testar

```bash
node --test        # engine (regras do jogo) — zero dependências, rng injetado
npx vitest run     # app React (slices, efeitos, componentes, integração por modo)
npx tsc --noEmit   # type-check
```

## Arquitetura

React 18 + Vite + TypeScript + Redux Toolkit sobre um engine de regras puro.
(O protótipo original no runtime DC foi aposentado no cutover de 2026-07 — vive no git history.)

```
engine/ (regras puras, JS/UMD)  →  src/ (React: shim → slices → selectors → componentes)
```

### `engine/` — regras do jogo, zero UI

Funções puras sobre um objeto de estado plano. UMD: `window.Fluxo.*` no browser, `module.exports` no Node (testes). **Não muda por causa de UI** — é a fonte única das regras.

| Arquivo | Responsabilidade |
|---|---|
| `config.js` | Todo o balanceamento + chaves públicas do placar online (`placarOnline`). |
| `ativos.js` | Definição dos 5 ativos (retorno, volatilidade, dividendo, risco, textos). |
| `eventos.js` | Tabela de eventos aleatórios com pesos + sorteio (filtros por modo). |
| `regras.js` | O coração: `novoJogo`, `fecharMes`, `mover`, `cobrir`, mecânicas de empresário/aposentadoria/imóveis. |
| `formato.js` | `fmt` (R$), `fmtCompacto`, `fmtTempo`, `sparkline`. |
| `placar.js` | Placar global: um board por modo, Supabase via REST, fallback localStorage. |
| `conceitos.js` | Dicionário central educacional: termos do glossário + tooltips e a regra de desbloqueio. |

A aleatoriedade entra por parâmetro (`rng`), nunca por `Math.random` fixo — é isso que torna as regras testáveis. Semântica das transições: `fecharMes` muta e retorna o estado completo; as demais retornam parciais pra merge.

### `src/` — app React

| Pasta | Responsabilidade |
|---|---|
| `engine/` | **Shim tipado** do engine UMD: único ponto de import (`index.ts`) + tipos (`types.ts`). Aceita o branch global (browser) e o CommonJS (Vitest/build). |
| `store/` | `configureStore` + `listeners.ts` (efeitos: persistir conceitos, registrar/enviar placar, gatilhos educacionais de estado). |
| `features/game/` | `gameSlice` (reducers embrulham o engine: clone→call→merge) + `selectors.ts` (o view-model inteiro — ex-`renderVals`). |
| `features/conceitos/` | Slice do conteúdo educacional + `thunks.ts` (interceptação de 1ª vez com **ação pendente serializável**). |
| `features/placar/` | Nick, board global (thunk `carregarPlacar`) e o view-model do leaderboard. |
| `components/` | Telas só-apresentação (uma por card/overlay), estilos inline herdados do protótipo. |
| `views/` | `GameView` (composição da tela de jogo). |
| `hooks/` | `useGameLoop` (tick 500ms/AUTO) e `useAtalhos` (ESPAÇO/A/G/ESC/ENTER com guards). |

**Regra de ouro**: componente não calcula regra de negócio; selector não muta; efeito colateral só em thunk/listener; o engine é dono de toda transição de estado do jogo.

## Placar global (Supabase)

Um board por modo; sem chaves em `config.placarOnline` cai no placar local do dispositivo. Setup: crie um projeto free em supabase.com, rode a migração `supabase/migrations/*_hardening_placar.sql` (schema + RLS + trigger anti-score-forjado) e cole URL + publishable key no `config.js`. A publishable key é pública por design; a segurança é o RLS + trigger (score recalculado no servidor). Segredos de tooling (token do CLI, senha do banco) ficam no `.env` (gitignorado — ver `.env.example`).

Nota do free tier: o projeto **pausa após ~7 dias sem uso** (o jogo cai graciosamente pro placar local). Restaure no painel ou via Management API.

## Receitas rápidas

- **Mudar balanceamento**: `engine/config.js`.
- **Adicionar um modo de jogo**: entre em `config.modos` com `disponivel: false` ("EM BREVE" automático no menu). Mecânica: trate o `modo` em `engine/regras.js` + testes; UI: selectors em `src/features/game/selectors.ts` e, se precisar, um card novo em `src/components/`. O placar do modo é automático se ele terminar com `s.fim`; ajuste `scoreDe` em `engine/placar.js` se a métrica não for "menos meses".
- **Adicionar um conceito educacional**: nova entrada em `engine/conceitos.js` (`tooltips` + `termos`). Gatilho por clique: intercepte com `executarComConceito` em `src/features/conceitos/thunks.ts`; gatilho por estado: adicione a condição no listener 3 de `src/store/listeners.ts`. Glossário atualiza sozinho.
- **Adicionar um ativo**: `engine/ativos.js` (+ ordem de liquidação em `config.js`). A UI o exibe automaticamente.
- **Adicionar um evento**: item com peso `p` e `run` em `engine/eventos.js` (use `modos:` pra restringir).
- **Nova regra de turno**: `engine/regras.js` (`fecharMes`) + teste em `tests/engine.test.js`; exponha na UI via selector.
- **Mexer no visual**: o componente correspondente em `src/components/` (estilos inline).
