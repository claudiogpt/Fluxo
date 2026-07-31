# Graph Report - Fluxo  (2026-07-30)

## Corpus Check
- 108 files · ~62,177 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 617 nodes · 1125 edges · 35 communities (26 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1cce95c2`
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
- [[_COMMUNITY_Leaderboard.tsx|Leaderboard.tsx]]
- [[_COMMUNITY_index.ts|index.ts]]
- [[_COMMUNITY_conceitosSlice.ts|conceitosSlice.ts]]
- [[_COMMUNITY_FimDeJogo.tsx|FimDeJogo.tsx]]
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
- [[_COMMUNITY_thunks.ts|thunks.ts]]
- [[_COMMUNITY_config.js|config.js]]
- [[_COMMUNITY_CatalogoApi|CatalogoApi]]
- [[_COMMUNITY_realista.js|realista.js]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `AppDispatch` - 17 edges
3. `RealistaApi` - 16 edges
4. `RegrasApi` - 13 edges
5. `PlacarApi` - 13 edges
6. `makeStore()` - 13 edges
7. `selectRota()` - 12 edges
8. `useAtalhos()` - 12 edges
9. `ESTUDOS` - 11 edges
10. `GameState` - 9 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `selectGame()`  [INFERRED]
  src/App.tsx → src/features/game/selectors.ts
- `LinkEstudo()` --references--> `ESTUDOS`  [EXTRACTED]
  src/components/menu/PaginaSetup.tsx → src/conteudo/fundamentos.ts
- `PaginaConfig()` --indirect_call--> `selectPrefs()`  [INFERRED]
  src/components/menu/PaginaConfig.tsx → src/features/prefs/prefsSlice.ts
- `App()` --indirect_call--> `selectTela()`  [INFERRED]
  src/App.tsx → src/features/game/selectors.ts
- `App()` --indirect_call--> `selectBibliotecaAberta()`  [INFERRED]
  src/App.tsx → src/features/ui/uiSlice.ts

## Import Cycles
- None detected.

## Communities (35 total, 9 thin omitted)

### Community 0 - "Regras do Jogo e Formatação"
Cohesion: 0.21
Nodes (13): addLog(), chavesZeradas(), cobrir(), defsDoModo(), fecharMes(), ganhoReinvestimento(), novoJogo(), parcelaFinanciamento() (+5 more)

### Community 1 - "Config, Ativos, Eventos e Testes"
Cohesion: 0.09
Nodes (22): choque(), pct(), sortear(), assert, ativos, catalogo, conceitos, config (+14 more)

### Community 2 - "Conceitos Educacionais e Menu"
Cohesion: 0.13
Nodes (10): NovoJogoProps, aportarPctComConceito(), comecarComConceito(), conceitoDoAtivo(), confirmarModal(), executarComConceito(), Thunk, gameSlice (+2 more)

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
Cohesion: 0.07
Nodes (24): CartaoEscolha(), Props, botaoDiscreto, botaoPrimario, cartao, dica, secaoTitulo, Props (+16 more)

### Community 7 - "selectors.ts"
Cohesion: 0.05
Nodes (26): AtivoCard(), Linha, Categorias, btnConfirmar, btnTampa, ControleAporte(), Leaderboard(), rotulo (+18 more)

### Community 10 - "Leaderboard.tsx"
Cohesion: 0.14
Nodes (22): diagnosticar(), Diagnostico, DIAGNOSTICOS, estudo(), ESTUDOS, Def, GatilhoId, GATILHOS (+14 more)

### Community 11 - "index.ts"
Cohesion: 0.16
Nodes (22): PaginaConfig(), Store, aplicarPrefs(), lerPrefs(), salvarPrefs(), valido(), ComPrefs, prefsSlice (+14 more)

### Community 12 - "conceitosSlice.ts"
Cohesion: 0.07
Nodes (49): BibliotecaConteudo(), CORPOS, Glossario(), Leitura(), NOMES, comForte(), h, Markdown() (+41 more)

### Community 14 - "FimDeJogo.tsx"
Cohesion: 0.67
Nodes (5): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos()

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
Cohesion: 0.11
Nodes (18): CategoriaDef, CustosRealista, DesafioDef, EstadoAposentadoria, EstadoImoveis, EstadoNegocio, FimDeJogo, Indexador (+10 more)

### Community 24 - "conceitos.js"
Cohesion: 0.05
Nodes (59): App(), Ajuda(), linha, LinhaHint(), montar(), Store, OverlayBiblioteca(), FimDeJogo() (+51 more)

### Community 25 - "cores.test.ts"
Cohesion: 0.47
Nodes (4): corDoEngine(), MAPA_COR_ENGINE, fontesApp, fontesEngine

### Community 28 - "StorageLike"
Cohesion: 0.20
Nodes (9): Engine JS e tipos, Exemplos bons vs ruins, Guia de docstrings — Fluxo (Google-style híbrido), Idioma, O que documentar, Onde ler mais, Reducers RTK, Template (+1 more)

### Community 38 - "realista.js"
Cohesion: 0.20
Nodes (18): aliquotaRF(), bloqueio(), classeDe(), clonar(), cobrir(), custosDoMes(), fecharContaDoMes(), fmtBR() (+10 more)

## Knowledge Gaps
- **150 isolated node(s):** `card`, `rotulo`, `botaoTopo`, `NOMES`, `CORPOS` (+145 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RealistaApi` connect `config.js` to `index.ts`, `types.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `RegrasApi` connect `RegrasApi` to `index.ts`, `types.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `PlacarApi` connect `PlacarApi` to `index.ts`, `types.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `card`, `rotulo`, `botaoTopo` to the rest of the system?**
  _150 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Config, Ativos, Eventos e Testes` be split into smaller, more focused modules?**
  _Cohesion score 0.09259259259259259 - nodes in this community are weakly interconnected._
- **Should `Conceitos Educacionais e Menu` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Compilador de Templates` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._