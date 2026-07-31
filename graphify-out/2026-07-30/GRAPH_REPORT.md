# Graph Report - Fluxo  (2026-07-30)

## Corpus Check
- 108 files · ~62,177 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 507 nodes · 730 edges · 42 communities (31 shown, 11 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bf0b43f8`
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
- [[_COMMUNITY_RegrasCard.tsx|RegrasCard.tsx]]
- [[_COMMUNITY_StorageLike|StorageLike]]
- [[_COMMUNITY_catalogo.js|catalogo.js]]
- [[_COMMUNITY_thunks.ts|thunks.ts]]
- [[_COMMUNITY_config.js|config.js]]
- [[_COMMUNITY_ControleAporte.tsx|ControleAporte.tsx]]
- [[_COMMUNITY_CatalogoApi|CatalogoApi]]
- [[_COMMUNITY_realista.js|realista.js]]
- [[_COMMUNITY_BotaoMenu.tsx|BotaoMenu.tsx]]
- [[_COMMUNITY_GameView.tsx|GameView.tsx]]
- [[_COMMUNITY_gameModos.test.ts|gameModos.test.ts]]
- [[_COMMUNITY_NegocioCard.tsx|NegocioCard.tsx]]
- [[_COMMUNITY_MacroCard.tsx|MacroCard.tsx]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `RealistaApi` - 16 edges
3. `RegrasApi` - 13 edges
4. `PlacarApi` - 13 edges
5. `Guia de docstrings — Fluxo (Google-style híbrido)` - 8 edges
6. `selectRota()` - 8 edges
7. `Peculium — Fluxo Financeiro` - 7 edges
8. `fecharMes()` - 7 edges
9. `scripts` - 7 edges
10. `aplicarPrefs()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `PaginaConfig()` --indirect_call--> `selectPrefs()`  [INFERRED]
  src/components/menu/PaginaConfig.tsx → src/features/prefs/prefsSlice.ts
- `usePrefs()` --indirect_call--> `selectPrefs()`  [INFERRED]
  src/hooks/usePrefs.ts → src/features/prefs/prefsSlice.ts
- `ControleAporte()` --indirect_call--> `selectGame()`  [INFERRED]
  src/components/ControleAporte.tsx → src/features/game/selectors.ts
- `MenuRouter()` --indirect_call--> `selectRota()`  [INFERRED]
  src/components/menu/MenuRouter.tsx → src/features/ui/uiSlice.ts
- `Sonda()` --calls--> `useAtalhos()`  [EXTRACTED]
  src/hooks/useAtalhos.test.tsx → src/hooks/useAtalhos.ts

## Import Cycles
- None detected.

## Communities (42 total, 11 thin omitted)

### Community 0 - "Regras do Jogo e Formatação"
Cohesion: 0.21
Nodes (13): addLog(), chavesZeradas(), cobrir(), defsDoModo(), fecharMes(), ganhoReinvestimento(), novoJogo(), parcelaFinanciamento() (+5 more)

### Community 1 - "Config, Ativos, Eventos e Testes"
Cohesion: 0.08
Nodes (27): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos(), choque(), pct(), sortear() (+19 more)

### Community 2 - "Conceitos Educacionais e Menu"
Cohesion: 0.27
Nodes (7): aportarPctComConceito(), comecarComConceito(), conceitoDoAtivo(), confirmarModal(), executarComConceito(), Thunk, valorDePct()

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
Cohesion: 0.08
Nodes (19): CartaoEscolha(), Props, botaoDiscreto, botaoPrimario, cartao, dica, secaoTitulo, Props (+11 more)

### Community 7 - "selectors.ts"
Cohesion: 0.12
Nodes (7): CatalogoDef, EstadoRealista, ComGame, linhaDe(), notaDeIR(), selectFimInfo, selectImovelCard

### Community 11 - "index.ts"
Cohesion: 0.16
Nodes (22): PaginaConfig(), Store, aplicarPrefs(), lerPrefs(), salvarPrefs(), valido(), ComPrefs, prefsSlice (+14 more)

### Community 12 - "conceitosSlice.ts"
Cohesion: 0.10
Nodes (16): App(), botaoTopo, card, PainelStatus(), rotulo, ComConceitos, comoStorage(), conceitosSlice (+8 more)

### Community 15 - "Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE""
Cohesion: 0.18
Nodes (10): Arquitetura, Como rodar, Como testar, `engine/` — regras do jogo, zero UI, Navegação e tema, Peculium — Fluxo Financeiro, Placar global (Supabase), Propósito do jogo (nesta ordem) (+2 more)

### Community 18 - "devDependencies"
Cohesion: 0.08
Nodes (25): comment_type, dependencies, react, react-dom, react-redux, @reduxjs/toolkit, devDependencies, jsdom (+17 more)

### Community 20 - "index.ts"
Cohesion: 0.13
Nodes (13): ativos, catalogo, conceitos, config, Fluxo, formato, global_, placar (+5 more)

### Community 21 - "types.ts"
Cohesion: 0.13
Nodes (14): CategoriaDef, CustosRealista, EstadoAposentadoria, EstadoImoveis, EstadoNegocio, FimDeJogo, Indexador, LogItem (+6 more)

### Community 24 - "conceitos.js"
Cohesion: 0.07
Nodes (24): Home(), MenuRouter(), PAGINAS, Store, GameState, NovoJogoProps, gameSlice, PROPS_PADRAO (+16 more)

### Community 25 - "cores.test.ts"
Cohesion: 0.47
Nodes (4): corDoEngine(), MAPA_COR_ENGINE, fontesApp, fontesEngine

### Community 28 - "StorageLike"
Cohesion: 0.20
Nodes (9): Engine JS e tipos, Exemplos bons vs ruins, Guia de docstrings — Fluxo (Google-style híbrido), Idioma, O que documentar, Onde ler mais, Reducers RTK, Template (+1 more)

### Community 35 - "ControleAporte.tsx"
Cohesion: 0.21
Nodes (8): AtivoCard(), Linha, btnConfirmar, btnTampa, ControleAporte(), AtivoKey, LinhaAtivo, selectGame()

### Community 38 - "realista.js"
Cohesion: 0.20
Nodes (18): aliquotaRF(), bloqueio(), classeDe(), clonar(), cobrir(), custosDoMes(), fecharContaDoMes(), fmtBR() (+10 more)

### Community 39 - "BotaoMenu.tsx"
Cohesion: 0.47
Nodes (3): Props, ItemMenu, ITENS_HOME

### Community 41 - "GameView.tsx"
Cohesion: 0.25
Nodes (6): CustosCard(), selectAtivosLista, selectCustosMes, selectPainel, Aba, ABAS

### Community 42 - "gameModos.test.ts"
Cohesion: 0.33
Nodes (3): Categorias, selectAtivosPorCategoria, selectCategoriasLista

### Community 43 - "NegocioCard.tsx"
Cohesion: 0.33
Nodes (4): btnAmbar, btnVerde, btnVermelho, selectNegocioCard

## Knowledge Gaps
- **141 isolated node(s):** `Store`, `prefsSlice`, `ComPrefs`, `Propósito do jogo (nesta ordem)`, `Como rodar` (+136 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RealistaApi` connect `config.js` to `index.ts`, `types.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `RegrasApi` connect `RegrasApi` to `index.ts`, `types.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `PlacarApi` connect `PlacarApi` to `index.ts`, `types.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `Store`, `prefsSlice`, `ComPrefs` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Config, Ativos, Eventos e Testes` be split into smaller, more focused modules?**
  _Cohesion score 0.0761904761904762 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Componentes` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Compilador de Templates` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._