# Graph Report - Fluxo  (2026-07-27)

## Corpus Check
- 76 files · ~28,091 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 399 nodes · 627 edges · 26 communities (21 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `39f83912`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Regras do Jogo e Formatação|Regras do Jogo e Formatação]]
- [[_COMMUNITY_Config, Ativos, Eventos e Testes|Config, Ativos, Eventos e Testes]]
- [[_COMMUNITY_Conceitos Educacionais e Menu|Conceitos Educacionais e Menu]]
- [[_COMMUNITY_Runtime DC Componentes|Runtime DC: Componentes]]
- [[_COMMUNITY_Placar Global (Supabase)|Placar Global (Supabase)]]
- [[_COMMUNITY_Runtime DC Compilador de Templates|Runtime DC: Compilador de Templates]]
- [[_COMMUNITY_App.tsx|App.tsx]]
- [[_COMMUNITY_selectors.ts|selectors.ts]]
- [[_COMMUNITY_conceitosSlice.ts|conceitosSlice.ts]]
- [[_COMMUNITY_index.ts|index.ts]]
- [[_COMMUNITY_conceitosSlice.ts|conceitosSlice.ts]]
- [[_COMMUNITY_Fluxo — Simulador Financeiro FALÊNCIA ou LIBERDADE|Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"]]
- [[_COMMUNITY_PlacarApi|PlacarApi]]
- [[_COMMUNITY_RegrasApi|RegrasApi]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_.mcp.json|.mcp.json]]
- [[_COMMUNITY_index.ts|index.ts]]
- [[_COMMUNITY_types.ts|types.ts]]
- [[_COMMUNITY_FormatoApi|FormatoApi]]
- [[_COMMUNITY_ConceitosApi|ConceitosApi]]
- [[_COMMUNITY_conceitos.js|conceitos.js]]
- [[_COMMUNITY_cores.test.ts|cores.test.ts]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `RegrasApi` - 13 edges
3. `PlacarApi` - 13 edges
4. `makeStore()` - 9 edges
5. `MenuLayout()` - 7 edges
6. `Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"` - 7 edges
7. `scripts` - 7 edges
8. `AppDispatch` - 6 edges
9. `aplicarPrefs()` - 6 edges
10. `PrefsState` - 6 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `selectGame()`  [INFERRED]
  src/App.tsx → src/features/game/selectors.ts
- `App()` --indirect_call--> `selectTela()`  [INFERRED]
  src/App.tsx → src/features/game/selectors.ts
- `AtivoCard()` --indirect_call--> `selectGame()`  [INFERRED]
  src/components/AtivoCard.tsx → src/features/game/selectors.ts
- `montar()` --calls--> `makeStore()`  [EXTRACTED]
  src/hooks/useAtalhos.test.tsx → src/store/index.ts
- `usePrefs()` --indirect_call--> `selectPrefs()`  [INFERRED]
  src/hooks/usePrefs.ts → src/features/prefs/prefsSlice.ts

## Import Cycles
- None detected.

## Communities (26 total, 5 thin omitted)

### Community 0 - "Regras do Jogo e Formatação"
Cohesion: 0.21
Nodes (12): addLog(), chavesZeradas(), cobrir(), fecharMes(), ganhoReinvestimento(), novoJogo(), parcelaFinanciamento(), patrimonio() (+4 more)

### Community 1 - "Config, Ativos, Eventos e Testes"
Cohesion: 0.09
Nodes (14): assert, ativos, conceitos, config, eventos, formato, mesCripto(), placar (+6 more)

### Community 2 - "Conceitos Educacionais e Menu"
Cohesion: 0.10
Nodes (20): Glossario(), gameSlice, PROPS_PADRAO, abrirSetupDeCenario(), abrirSetupDeModo(), ComUi, inicial, RotaId (+12 more)

### Community 3 - "Runtime DC: Componentes"
Cohesion: 0.17
Nodes (6): carregarPlacar, ComPlacarEGame, LB_ROTULOS, placarSlice, PlacarState, selectLeaderboard

### Community 4 - "Placar Global (Supabase)"
Cohesion: 0.22
Nodes (16): boardDe(), cabecalhos(), cfgPadrao(), enviarRemoto(), ler(), lerRemoto(), nick(), nomeLimpo() (+8 more)

### Community 5 - "Runtime DC: Compilador de Templates"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, allowJs, isolatedModules, jsx, lib, module, moduleDetection (+13 more)

### Community 6 - "App.tsx"
Cohesion: 0.08
Nodes (32): BotaoMenu(), Props, CartaoEscolha(), Props, botaoDiscreto, botaoPrimario, cartao, dica (+24 more)

### Community 7 - "selectors.ts"
Cohesion: 0.08
Nodes (26): App(), AtivoCard(), btnMais, btnMenos, Linha, ImovelCard(), Store, btnAmbar (+18 more)

### Community 9 - "conceitosSlice.ts"
Cohesion: 0.21
Nodes (7): placar, AtivoKey, comecarComConceito(), confirmarModal(), executarComConceito(), moverComConceito(), Thunk

### Community 11 - "index.ts"
Cohesion: 0.20
Nodes (18): aplicarPrefs(), lerPrefs(), salvarPrefs(), valido(), ComPrefs, prefsSlice, selectPrefs(), EscalaId (+10 more)

### Community 12 - "conceitosSlice.ts"
Cohesion: 0.16
Nodes (11): conceitos, StorageLike, ComConceitos, comoStorage(), conceitosSlice, ConceitosState, ModalConceito, selectContador (+3 more)

### Community 15 - "Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE""
Cohesion: 0.20
Nodes (9): Arquitetura, Como rodar, Como testar, `engine/` — regras do jogo, zero UI, Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE", Placar global (Supabase), Propósito do jogo (nesta ordem), Receitas rápidas (+1 more)

### Community 18 - "devDependencies"
Cohesion: 0.08
Nodes (25): comment_type, dependencies, react, react-dom, react-redux, @reduxjs/toolkit, devDependencies, jsdom (+17 more)

### Community 20 - "index.ts"
Cohesion: 0.18
Nodes (9): ativos, config, Fluxo, formato, global_, regras, AtivoDef, ConfigApi (+1 more)

### Community 21 - "types.ts"
Cohesion: 0.15
Nodes (12): Dificuldade, EstadoAposentadoria, EstadoImoveis, EstadoNegocio, FimDeJogo, GameState, LogItem, ModoDef (+4 more)

### Community 24 - "conceitos.js"
Cohesion: 0.67
Nodes (5): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos()

### Community 25 - "cores.test.ts"
Cohesion: 0.47
Nodes (4): corDoEngine(), MAPA_COR_ENGINE, fontesApp, fontesEngine

## Knowledge Gaps
- **118 isolated node(s):** `Props`, `PAGINAS`, `Store`, `Store`, `ComGame` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PlacarApi` connect `PlacarApi` to `index.ts`, `types.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `RegrasApi` connect `RegrasApi` to `conceitosSlice.ts`, `index.ts`, `types.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `makeStore()` connect `Conceitos Educacionais e Menu` to `conceitosSlice.ts`, `index.ts`, `conceitosSlice.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `Props`, `PAGINAS`, `Store` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Config, Ativos, Eventos e Testes` be split into smaller, more focused modules?**
  _Cohesion score 0.08547008547008547 - nodes in this community are weakly interconnected._
- **Should `Conceitos Educacionais e Menu` be split into smaller, more focused modules?**
  _Cohesion score 0.1021021021021021 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Compilador de Templates` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._