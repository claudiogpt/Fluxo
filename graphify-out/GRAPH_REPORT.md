# Graph Report - Fluxo  (2026-07-28)

## Corpus Check
- 82 files · ~31,244 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 416 nodes · 579 edges · 36 communities (29 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8e46e9e0`
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
- [[_COMMUNITY_GameView.tsx|GameView.tsx]]
- [[_COMMUNITY_RegrasCard.tsx|RegrasCard.tsx]]
- [[_COMMUNITY_StorageLike|StorageLike]]
- [[_COMMUNITY_thunks.ts|thunks.ts]]
- [[_COMMUNITY_ControleAporte.tsx|ControleAporte.tsx]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `RegrasApi` - 13 edges
3. `PlacarApi` - 13 edges
4. `selectRota()` - 9 edges
5. `Peculium — Fluxo Financeiro` - 7 edges
6. `scripts` - 7 edges
7. `ConceitosApi` - 6 edges
8. `FormatoApi` - 6 edges
9. `aplicarPrefs()` - 6 edges
10. `PrefsState` - 6 edges

## Surprising Connections (you probably didn't know these)
- `MenuRouter()` --indirect_call--> `selectRota()`  [INFERRED]
  src/components/menu/MenuRouter.tsx → src/features/ui/uiSlice.ts
- `Sonda()` --calls--> `useAtalhos()`  [EXTRACTED]
  src/hooks/useAtalhos.test.tsx → src/hooks/useAtalhos.ts
- `usePrefs()` --indirect_call--> `selectPrefs()`  [INFERRED]
  src/hooks/usePrefs.ts → src/features/prefs/prefsSlice.ts
- `Props` --references--> `ItemMenu`  [EXTRACTED]
  src/components/menu/BotaoMenu.tsx → src/features/ui/menuItens.ts
- `ItemMenu` --references--> `RotaId`  [EXTRACTED]
  src/features/ui/menuItens.ts → src/features/ui/uiSlice.ts

## Import Cycles
- None detected.

## Communities (36 total, 7 thin omitted)

### Community 0 - "Regras do Jogo e Formatação"
Cohesion: 0.21
Nodes (12): addLog(), chavesZeradas(), cobrir(), fecharMes(), ganhoReinvestimento(), novoJogo(), parcelaFinanciamento(), patrimonio() (+4 more)

### Community 1 - "Config, Ativos, Eventos e Testes"
Cohesion: 0.12
Nodes (19): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos(), assert, ativos, conceitos (+11 more)

### Community 2 - "Conceitos Educacionais e Menu"
Cohesion: 0.19
Nodes (8): gameSlice, PROPS_PADRAO, abrirSetupDeCenario(), abrirSetupDeModo(), selectPodeVoltar(), AppDispatch, makeStore(), RootState

### Community 3 - "Runtime DC: Componentes"
Cohesion: 0.14
Nodes (8): carregarPlacar, ComPlacarEGame, LB_ROTULOS, placarSlice, PlacarState, selectLeaderboard, listener, startListening

### Community 4 - "Placar Global (Supabase)"
Cohesion: 0.22
Nodes (16): boardDe(), cabecalhos(), cfgPadrao(), enviarRemoto(), ler(), lerRemoto(), nick(), nomeLimpo() (+8 more)

### Community 5 - "Runtime DC: Compilador de Templates"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, allowJs, isolatedModules, jsx, lib, module, moduleDetection (+13 more)

### Community 6 - "App.tsx"
Cohesion: 0.12
Nodes (17): CartaoEscolha(), Props, botaoDiscreto, botaoPrimario, cartao, dica, secaoTitulo, GrupoOpcoes() (+9 more)

### Community 7 - "selectors.ts"
Cohesion: 0.10
Nodes (11): btnAmbar, btnVerde, btnVermelho, ComGame, selectAtivosLista, selectFimInfo, selectImovelCard, selectLogLinhas (+3 more)

### Community 11 - "index.ts"
Cohesion: 0.24
Nodes (16): aplicarPrefs(), lerPrefs(), salvarPrefs(), valido(), ComPrefs, prefsSlice, selectPrefs(), EscalaId (+8 more)

### Community 12 - "conceitosSlice.ts"
Cohesion: 0.17
Nodes (10): conceitos, ComConceitos, comoStorage(), conceitosSlice, ConceitosState, ModalConceito, selectContador, selectGlossarioLista (+2 more)

### Community 15 - "Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE""
Cohesion: 0.18
Nodes (10): Arquitetura, Como rodar, Como testar, `engine/` — regras do jogo, zero UI, Navegação e tema, Peculium — Fluxo Financeiro, Placar global (Supabase), Propósito do jogo (nesta ordem) (+2 more)

### Community 18 - "devDependencies"
Cohesion: 0.08
Nodes (25): comment_type, dependencies, react, react-dom, react-redux, @reduxjs/toolkit, devDependencies, jsdom (+17 more)

### Community 20 - "index.ts"
Cohesion: 0.17
Nodes (10): ativos, config, Fluxo, formato, global_, placar, regras, AtivoDef (+2 more)

### Community 21 - "types.ts"
Cohesion: 0.14
Nodes (13): AtivoKey, Dificuldade, EstadoAposentadoria, EstadoImoveis, EstadoNegocio, FimDeJogo, GameState, LogItem (+5 more)

### Community 24 - "conceitos.js"
Cohesion: 0.08
Nodes (20): Props, Home(), MenuRouter(), PAGINAS, Store, PaginaConfig(), PaginaGlossario(), TermosGlossario() (+12 more)

### Community 25 - "cores.test.ts"
Cohesion: 0.47
Nodes (4): corDoEngine(), MAPA_COR_ENGINE, fontesApp, fontesEngine

### Community 26 - "GameView.tsx"
Cohesion: 0.12
Nodes (11): App(), AtivoCard(), Linha, Store, card, PainelStatus(), rotulo, store (+3 more)

### Community 30 - "thunks.ts"
Cohesion: 0.29
Nodes (6): aportarPctComConceito(), comecarComConceito(), confirmarModal(), executarComConceito(), Thunk, valorDePct()

### Community 35 - "ControleAporte.tsx"
Cohesion: 0.33
Nodes (3): btnConfirmar, btnTampa, ControleAporte()

## Knowledge Gaps
- **126 isolated node(s):** `Propósito do jogo (nesta ordem)`, `Como rodar`, `Como testar`, ``engine/` — regras do jogo, zero UI`, ``src/` — app React` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RegrasApi` connect `RegrasApi` to `index.ts`, `types.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `PlacarApi` connect `PlacarApi` to `index.ts`, `types.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `selectRota()` connect `conceitos.js` to `GameView.tsx`, `Conceitos Educacionais e Menu`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `Propósito do jogo (nesta ordem)`, `Como rodar`, `Como testar` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Config, Ativos, Eventos e Testes` be split into smaller, more focused modules?**
  _Cohesion score 0.11594202898550725 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Componentes` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Compilador de Templates` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._