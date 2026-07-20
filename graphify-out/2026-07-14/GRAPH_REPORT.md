# Graph Report - Fluxo  (2026-07-14)

## Corpus Check
- 22 files · ~25,371 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 228 nodes · 346 edges · 16 communities (11 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a9a48c90`
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
- [[_COMMUNITY_Runtime DC Boot e Parsing|Runtime DC: Boot e Parsing]]
- [[_COMMUNITY_Fim de Jogo|Fim de Jogo]]
- [[_COMMUNITY_Card do Negócio|Card do Negócio]]
- [[_COMMUNITY_Painel de Status|Painel de Status]]
- [[_COMMUNITY_Terminal de Eventos|Terminal de Eventos]]
- [[_COMMUNITY_Fluxo — Simulador Financeiro FALÊNCIA ou LIBERDADE|Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_.mcp.json|.mcp.json]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 19 edges
2. `renderVals (view-model)` - 10 edges
3. `createRuntime()` - 9 edges
4. `boot()` - 8 edges
5. `walkChildren()` - 8 edges
6. `walk()` - 8 edges
7. `fecharMes()` - 7 edges
8. `scripts` - 7 edges
9. `getReact()` - 7 edges
10. `resolve()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `renderVals (view-model)` --calls--> `fmt()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/formato.js
- `renderVals (view-model)` --calls--> `sparkline()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/formato.js
- `Component (Orquestrador do jogo)` --calls--> `nick()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/placar.js
- `Component (Orquestrador do jogo)` --calls--> `salvarNick()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/placar.js
- `renderVals (view-model)` --calls--> `vitoria()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/placar.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Camada de overlays modais fixos (position:fixed, z-index empilhado)** — conceitomodal_dc_conceitomodal, fimdejogo_dc_fimdejogo, glossario_dc_glossario [INFERRED 0.80]
- **Fluxo de desbloqueio de termos do glossário** — conceitomodal_dc_conceitomodal, glossario_dc_glossario, glossario_dc_volatilidade [INFERRED 0.80]

## Communities (16 total, 5 thin omitted)

### Community 0 - "Regras do Jogo e Formatação"
Cohesion: 0.12
Nodes (20): fmt(), sparkline(), vitoria(), addLog(), chavesZeradas(), cobrir(), fecharMes(), ganhoReinvestimento() (+12 more)

### Community 1 - "Config, Ativos, Eventos e Testes"
Cohesion: 0.07
Nodes (19): ConceitosApi, FluxoGlobal, StorageLike, Termo, Tooltip, assert, ativos, conceitos (+11 more)

### Community 2 - "Conceitos Educacionais e Menu"
Cohesion: 0.27
Nodes (11): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos(), mover(), Nickname Input (Placar Global), executarComConceito (+3 more)

### Community 3 - "Runtime DC: Componentes"
Cohesion: 0.08
Nodes (44): react, boot(), collectProps(), compileAttr(), compileTemplate(), contentKey(), createComponentFactory(), createExternalModules() (+36 more)

### Community 4 - "Placar Global (Supabase)"
Cohesion: 0.23
Nodes (18): boardDe(), cabecalhos(), cfgPadrao(), enviarRemoto(), ler(), lerRemoto(), nick(), nomeLimpo() (+10 more)

### Community 5 - "Runtime DC: Compilador de Templates"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, allowJs, isolatedModules, jsx, lib, module, moduleDetection (+13 more)

### Community 6 - "Telas de Cards e Glossário"
Cohesion: 0.36
Nodes (8): AtivoCard (card de ativo com aporte/resgate), ConceitoModal (modal educacional de primeira vez), CDI, Glossario (painel de termos desbloqueáveis), Volatilidade, Comprar Financiado vs Alugar e Investir, Fantasma (carteira alugar+investir comparativa), ImovelCard (card de moradia, cenário imóveis)

### Community 7 - "Runtime DC: Boot e Parsing"
Cohesion: 0.50
Nodes (3): AppDispatch, RootState, store

### Community 15 - "Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE""
Cohesion: 0.17
Nodes (11): Arquitetura, Como rodar, Como testar, `engine/` — regras do jogo, zero UI, Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE", Placar global (Supabase), Propósito do jogo (nesta ordem), Receitas rápidas (+3 more)

### Community 18 - "devDependencies"
Cohesion: 0.08
Nodes (24): comment_type, dependencies, react-dom, react-redux, @reduxjs/toolkit, devDependencies, jsdom, supabase (+16 more)

## Knowledge Gaps
- **71 isolated node(s):** `supabase`, `name`, `private`, `comment_type`, `dev` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `devDependencies` to `Runtime DC: Componentes`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `boot()` connect `Runtime DC: Componentes` to `devDependencies`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `react-dom` connect `devDependencies` to `Runtime DC: Componentes`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `supabase`, `name`, `private` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Regras do Jogo e Formatação` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Config, Ativos, Eventos e Testes` be split into smaller, more focused modules?**
  _Cohesion score 0.06890756302521009 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Componentes` be split into smaller, more focused modules?**
  _Cohesion score 0.07532467532467532 - nodes in this community are weakly interconnected._