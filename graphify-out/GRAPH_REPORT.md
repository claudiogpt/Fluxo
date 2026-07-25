# Graph Report - Fluxo  (2026-07-25)

## Corpus Check
- 46 files · ~23,333 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 298 nodes · 462 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c4953e9c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Regras do Jogo e Formatação|Regras do Jogo e Formatação]]
- [[_COMMUNITY_Config, Ativos, Eventos e Testes|Config, Ativos, Eventos e Testes]]
- [[_COMMUNITY_Conceitos Educacionais e Menu|Conceitos Educacionais e Menu]]
- [[_COMMUNITY_Runtime DC Componentes|Runtime DC: Componentes]]
- [[_COMMUNITY_Placar Global (Supabase)|Placar Global (Supabase)]]
- [[_COMMUNITY_Runtime DC Compilador de Templates|Runtime DC: Compilador de Templates]]
- [[_COMMUNITY_selectors.ts|selectors.ts]]
- [[_COMMUNITY_conceitosSlice.ts|conceitosSlice.ts]]
- [[_COMMUNITY_placarSlice.ts|placarSlice.ts]]
- [[_COMMUNITY_Fluxo — Simulador Financeiro FALÊNCIA ou LIBERDADE|Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"]]
- [[_COMMUNITY_PlacarApi|PlacarApi]]
- [[_COMMUNITY_RegrasApi|RegrasApi]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_.mcp.json|.mcp.json]]
- [[_COMMUNITY_types.ts|types.ts]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `RegrasApi` - 13 edges
3. `PlacarApi` - 13 edges
4. `Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"` - 7 edges
5. `App()` - 7 edges
6. `AppDispatch` - 7 edges
7. `scripts` - 7 edges
8. `ConceitosApi` - 6 edges
9. `FormatoApi` - 6 edges
10. `useAtalhos()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `selectGame()`  [INFERRED]
  src/App.tsx → src/features/game/selectors.ts
- `App()` --indirect_call--> `selectTela()`  [INFERRED]
  src/App.tsx → src/features/game/selectors.ts
- `App()` --calls--> `carregarPlacar`  [EXTRACTED]
  src/App.tsx → src/features/placar/placarSlice.ts
- `App()` --calls--> `useAtalhos()`  [EXTRACTED]
  src/App.tsx → src/hooks/useAtalhos.ts
- `App()` --calls--> `useGameLoop()`  [EXTRACTED]
  src/App.tsx → src/hooks/useGameLoop.ts

## Import Cycles
- None detected.

## Communities (16 total, 3 thin omitted)

### Community 0 - "Regras do Jogo e Formatação"
Cohesion: 0.21
Nodes (12): addLog(), chavesZeradas(), cobrir(), fecharMes(), ganhoReinvestimento(), novoJogo(), parcelaFinanciamento(), patrimonio() (+4 more)

### Community 1 - "Config, Ativos, Eventos e Testes"
Cohesion: 0.08
Nodes (19): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos(), assert, ativos, conceitos (+11 more)

### Community 2 - "Conceitos Educacionais e Menu"
Cohesion: 0.10
Nodes (28): App(), ConceitoModal(), FimDeJogo(), btnToggle(), Intro(), REGRAS, secaoTitulo, ativos (+20 more)

### Community 3 - "Runtime DC: Componentes"
Cohesion: 0.16
Nodes (9): config, formato, ComGame, selectAtivosLista, selectFimInfo, selectImovelCard, selectIntroConfig, selectNegocioCard (+1 more)

### Community 4 - "Placar Global (Supabase)"
Cohesion: 0.22
Nodes (16): boardDe(), cabecalhos(), cfgPadrao(), enviarRemoto(), ler(), lerRemoto(), nick(), nomeLimpo() (+8 more)

### Community 5 - "Runtime DC: Compilador de Templates"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, allowJs, isolatedModules, jsx, lib, module, moduleDetection (+13 more)

### Community 7 - "selectors.ts"
Cohesion: 0.12
Nodes (15): AtivoCard(), btnMais, btnMenos, Linha, ImovelCard(), Leaderboard(), btnAmbar, btnVerde (+7 more)

### Community 9 - "conceitosSlice.ts"
Cohesion: 0.13
Nodes (13): Glossario(), conceitos, StorageLike, ComConceitos, comoStorage(), conceitosSlice, ConceitosState, ModalConceito (+5 more)

### Community 10 - "placarSlice.ts"
Cohesion: 0.18
Nodes (6): RegistroPlacar, ComPlacarEGame, LB_ROTULOS, placarSlice, PlacarState, selectLeaderboard

### Community 15 - "Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE""
Cohesion: 0.20
Nodes (9): Arquitetura, Como rodar, Como testar, `engine/` — regras do jogo, zero UI, Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE", Placar global (Supabase), Propósito do jogo (nesta ordem), Receitas rápidas (+1 more)

### Community 18 - "devDependencies"
Cohesion: 0.08
Nodes (25): comment_type, dependencies, react, react-dom, react-redux, @reduxjs/toolkit, devDependencies, jsdom (+17 more)

### Community 21 - "types.ts"
Cohesion: 0.08
Nodes (20): Fluxo, global_, AtivoDef, ConceitosApi, ConfigApi, Dificuldade, EstadoAposentadoria, EstadoImoveis (+12 more)

## Knowledge Gaps
- **93 isolated node(s):** `Propósito do jogo (nesta ordem)`, `Como rodar`, `Como testar`, ``engine/` — regras do jogo, zero UI`, ``src/` — app React` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PlacarApi` connect `PlacarApi` to `types.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `RegrasApi` connect `RegrasApi` to `types.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `Propósito do jogo (nesta ordem)`, `Como rodar`, `Como testar` to the rest of the system?**
  _93 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Config, Ativos, Eventos e Testes` be split into smaller, more focused modules?**
  _Cohesion score 0.07765151515151515 - nodes in this community are weakly interconnected._
- **Should `Conceitos Educacionais e Menu` be split into smaller, more focused modules?**
  _Cohesion score 0.0975609756097561 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Compilador de Templates` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `selectors.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._