# Graph Report - Fluxo  (2026-07-25)

## Corpus Check
- 47 files · ~36,350 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 381 nodes · 687 edges · 25 communities (16 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `09d6ac42`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Regras do Jogo e Formatação|Regras do Jogo e Formatação]]
- [[_COMMUNITY_Config, Ativos, Eventos e Testes|Config, Ativos, Eventos e Testes]]
- [[_COMMUNITY_Conceitos Educacionais e Menu|Conceitos Educacionais e Menu]]
- [[_COMMUNITY_Runtime DC Componentes|Runtime DC: Componentes]]
- [[_COMMUNITY_Placar Global (Supabase)|Placar Global (Supabase)]]
- [[_COMMUNITY_Runtime DC Compilador de Templates|Runtime DC: Compilador de Templates]]
- [[_COMMUNITY_Telas de Cards e Glossário|Telas de Cards e Glossário]]
- [[_COMMUNITY_selectors.ts|selectors.ts]]
- [[_COMMUNITY_conceitosSlice.ts|conceitosSlice.ts]]
- [[_COMMUNITY_placarSlice.ts|placarSlice.ts]]
- [[_COMMUNITY_Fim de Jogo|Fim de Jogo]]
- [[_COMMUNITY_Card do Negócio|Card do Negócio]]
- [[_COMMUNITY_Painel de Status|Painel de Status]]
- [[_COMMUNITY_Terminal de Eventos|Terminal de Eventos]]
- [[_COMMUNITY_Fluxo — Simulador Financeiro FALÊNCIA ou LIBERDADE|Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"]]
- [[_COMMUNITY_PlacarApi|PlacarApi]]
- [[_COMMUNITY_RegrasApi|RegrasApi]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_.mcp.json|.mcp.json]]
- [[_COMMUNITY_gameSlice.ts|gameSlice.ts]]
- [[_COMMUNITY_types.ts|types.ts]]
- [[_COMMUNITY_index.ts|index.ts]]
- [[_COMMUNITY_ConceitosApi|ConceitosApi]]
- [[_COMMUNITY_FormatoApi|FormatoApi]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `RegrasApi` - 13 edges
3. `PlacarApi` - 13 edges
4. `AppDispatch` - 13 edges
5. `renderVals (view-model)` - 10 edges
6. `createRuntime()` - 9 edges
7. `boot()` - 8 edges
8. `walkChildren()` - 8 edges
9. `walk()` - 8 edges
10. `Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"` - 7 edges

## Surprising Connections (you probably didn't know these)
- `renderVals (view-model)` --calls--> `vitoria()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/placar.js
- `renderVals (view-model)` --calls--> `fmt()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/formato.js
- `renderVals (view-model)` --calls--> `sparkline()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/formato.js
- `renderVals (view-model)` --calls--> `ler()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/placar.js
- `Component (Orquestrador do jogo)` --calls--> `novoJogo()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/regras.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Camada de overlays modais fixos (position:fixed, z-index empilhado)** — conceitomodal_dc_conceitomodal, fimdejogo_dc_fimdejogo, glossario_dc_glossario [INFERRED 0.80]
- **Fluxo de desbloqueio de termos do glossário** — conceitomodal_dc_conceitomodal, glossario_dc_glossario, glossario_dc_volatilidade [INFERRED 0.80]

## Communities (25 total, 9 thin omitted)

### Community 0 - "Regras do Jogo e Formatação"
Cohesion: 0.13
Nodes (19): fmt(), sparkline(), addLog(), chavesZeradas(), cobrir(), fecharMes(), ganhoReinvestimento(), novoJogo() (+11 more)

### Community 1 - "Config, Ativos, Eventos e Testes"
Cohesion: 0.11
Nodes (14): assert, ativos, conceitos, config, eventos, formato, mesCripto(), placar (+6 more)

### Community 2 - "Conceitos Educacionais e Menu"
Cohesion: 0.10
Nodes (34): App(), AtivoCard(), btnMais, btnMenos, Linha, ConceitoModal(), FimDeJogo(), btnToggle() (+26 more)

### Community 3 - "Runtime DC: Componentes"
Cohesion: 0.08
Nodes (44): react, boot(), collectProps(), compileAttr(), compileTemplate(), contentKey(), createComponentFactory(), createExternalModules() (+36 more)

### Community 4 - "Placar Global (Supabase)"
Cohesion: 0.12
Nodes (30): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos(), boardDe(), cabecalhos(), cfgPadrao() (+22 more)

### Community 5 - "Runtime DC: Compilador de Templates"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, allowJs, isolatedModules, jsx, lib, module, moduleDetection (+13 more)

### Community 6 - "Telas de Cards e Glossário"
Cohesion: 0.36
Nodes (8): AtivoCard (card de ativo com aporte/resgate), ConceitoModal (modal educacional de primeira vez), CDI, Glossario (painel de termos desbloqueáveis), Volatilidade, Comprar Financiado vs Alugar e Investir, Fantasma (carteira alugar+investir comparativa), ImovelCard (card de moradia, cenário imóveis)

### Community 7 - "selectors.ts"
Cohesion: 0.13
Nodes (16): ImovelCard(), btnAmbar, btnVerde, btnVermelho, NegocioCard(), card, PainelStatus(), rotulo (+8 more)

### Community 9 - "conceitosSlice.ts"
Cohesion: 0.16
Nodes (13): Glossario(), conceitos, StorageLike, ComConceitos, comoStorage(), conceitosSlice, ConceitosState, ModalConceito (+5 more)

### Community 10 - "placarSlice.ts"
Cohesion: 0.15
Nodes (9): Leaderboard(), config, formato, RegistroPlacar, ComPlacarEGame, LB_ROTULOS, placarSlice, PlacarState (+1 more)

### Community 15 - "Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE""
Cohesion: 0.15
Nodes (12): Arquitetura, Como rodar, Como testar, `engine/` — regras do jogo, zero UI, Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE", Placar global (Supabase), Propósito do jogo (nesta ordem), Receitas rápidas (+4 more)

### Community 18 - "devDependencies"
Cohesion: 0.08
Nodes (24): comment_type, dependencies, react-dom, react-redux, @reduxjs/toolkit, devDependencies, jsdom, supabase (+16 more)

### Community 20 - "gameSlice.ts"
Cohesion: 0.22
Nodes (6): regras, Dificuldade, GameState, NovoJogoProps, gameSlice, PROPS_PADRAO

### Community 21 - "types.ts"
Cohesion: 0.22
Nodes (8): EstadoAposentadoria, EstadoImoveis, EstadoNegocio, FimDeJogo, LogItem, ModoDef, Termo, Tooltip

### Community 22 - "index.ts"
Cohesion: 0.25
Nodes (6): ativos, Fluxo, global_, AtivoDef, ConfigApi, FluxoGlobal

## Knowledge Gaps
- **100 isolated node(s):** `Propósito do jogo (nesta ordem)`, `Como rodar`, `Como testar`, ``src/` — app React (o futuro)`, ``engine/` — regras do jogo, zero UI` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PlacarApi` connect `PlacarApi` to `types.ts`, `index.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `RegrasApi` connect `RegrasApi` to `Conceitos Educacionais e Menu`, `types.ts`, `index.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `dependencies` connect `devDependencies` to `Runtime DC: Componentes`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `Propósito do jogo (nesta ordem)`, `Como rodar`, `Como testar` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Regras do Jogo e Formatação` be split into smaller, more focused modules?**
  _Cohesion score 0.12666666666666668 - nodes in this community are weakly interconnected._
- **Should `Config, Ativos, Eventos e Testes` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._
- **Should `Conceitos Educacionais e Menu` be split into smaller, more focused modules?**
  _Cohesion score 0.09929078014184398 - nodes in this community are weakly interconnected._