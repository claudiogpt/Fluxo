# Graph Report - Fluxo  (2026-07-13)

## Corpus Check
- 13 files · ~24,270 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 159 nodes · 267 edges · 20 communities (16 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a19ad3a`
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
- [[_COMMUNITY_Runtime DC Registro e Módulos|Runtime DC: Registro e Módulos]]
- [[_COMMUNITY_Runtime DC Fábrica de Componentes|Runtime DC: Fábrica de Componentes]]
- [[_COMMUNITY_Runtime DC Resolução de Props|Runtime DC: Resolução de Props]]
- [[_COMMUNITY_Fim de Jogo|Fim de Jogo]]
- [[_COMMUNITY_Card do Negócio|Card do Negócio]]
- [[_COMMUNITY_Painel de Status|Painel de Status]]
- [[_COMMUNITY_Terminal de Eventos|Terminal de Eventos]]
- [[_COMMUNITY_Fluxo — Simulador Financeiro FALÊNCIA ou LIBERDADE|Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"]]
- [[_COMMUNITY_rootNameForDocument|rootNameForDocument]]

## God Nodes (most connected - your core abstractions)
1. `renderVals (view-model)` - 10 edges
2. `createRuntime()` - 9 edges
3. `walkChildren()` - 8 edges
4. `walk()` - 8 edges
5. `Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"` - 7 edges
6. `fecharMes()` - 7 edges
7. `getReact()` - 7 edges
8. `boot()` - 7 edges
9. `resolve()` - 7 edges
10. `compileAttr()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Component (Orquestrador do jogo)` --calls--> `nick()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/placar.js
- `Component (Orquestrador do jogo)` --calls--> `salvarNick()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/placar.js
- `renderVals (view-model)` --calls--> `vitoria()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/placar.js
- `renderVals (view-model)` --calls--> `ler()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/placar.js
- `Component (Orquestrador do jogo)` --calls--> `novoJogo()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/regras.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Camada de overlays modais fixos (position:fixed, z-index empilhado)** — conceitomodal_dc_conceitomodal, fimdejogo_dc_fimdejogo, glossario_dc_glossario [INFERRED 0.80]
- **Fluxo de desbloqueio de termos do glossário** — conceitomodal_dc_conceitomodal, glossario_dc_glossario, glossario_dc_volatilidade [INFERRED 0.80]

## Communities (20 total, 4 thin omitted)

### Community 0 - "Regras do Jogo e Formatação"
Cohesion: 0.23
Nodes (12): addLog(), chavesZeradas(), cobrir(), fecharMes(), ganhoReinvestimento(), novoJogo(), parcelaFinanciamento(), patrimonio() (+4 more)

### Community 1 - "Config, Ativos, Eventos e Testes"
Cohesion: 0.14
Nodes (14): assert, ativos, conceitos, config, eventos, formato, mesCripto(), placar (+6 more)

### Community 2 - "Conceitos Educacionais e Menu"
Cohesion: 0.31
Nodes (10): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos(), mover(), Nickname Input (Placar Global), executarComConceito (+2 more)

### Community 3 - "Runtime DC: Componentes"
Cohesion: 0.12
Nodes (9): compileTemplate(), dcNameFromPath(), encodeCase(), isElementClass(), isRenderableType(), loadReactUmd(), loadScript(), rootNameForDocument() (+1 more)

### Community 4 - "Placar Global (Supabase)"
Cohesion: 0.22
Nodes (19): boardDe(), cabecalhos(), cfgPadrao(), enviarRemoto(), ler(), lerRemoto(), nick(), nomeLimpo() (+11 more)

### Community 5 - "Runtime DC: Compilador de Templates"
Cohesion: 0.33
Nodes (13): collectProps(), compileAttr(), contentKey(), cssToObj(), hostPositionStyle(), kebabToCamel(), walk(), walkChildren() (+5 more)

### Community 6 - "Telas de Cards e Glossário"
Cohesion: 0.36
Nodes (8): AtivoCard (card de ativo com aporte/resgate), ConceitoModal (modal educacional de primeira vez), CDI, Glossario (painel de termos desbloqueáveis), Volatilidade, Comprar Financiado vs Alugar e Investir, Fantasma (carteira alugar+investir comparativa), ImovelCard (card de moradia, cenário imóveis)

### Community 7 - "Runtime DC: Boot e Parsing"
Cohesion: 0.40
Nodes (6): boot(), getReactDOM(), init(), parseDataProps(), parseDcDocument(), parseDcText()

### Community 8 - "Runtime DC: Registro e Módulos"
Cohesion: 0.33
Nodes (6): createExternalModules(), createHelmetManager(), createPseudoSheet(), createRegistry(), createRuntime(), Placeholder()

### Community 9 - "Runtime DC: Fábrica de Componentes"
Cohesion: 0.40
Nodes (5): createComponentFactory(), evalDcLogic(), getReact(), walkText(), warnUnresolved()

### Community 10 - "Runtime DC: Resolução de Props"
Cohesion: 0.50
Nodes (4): findTopLevelEquality(), parensWrapWhole(), resolve(), resolvePath()

### Community 15 - "Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE""
Cohesion: 0.17
Nodes (11): Arquitetura, Como rodar, Como testar, `engine/` — regras do jogo, zero UI, Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE", Placar global (Supabase), Propósito do jogo (nesta ordem), Receitas rápidas (+3 more)

### Community 16 - "rootNameForDocument"
Cohesion: 0.22
Nodes (8): fmt(), sparkline(), vitoria(), Intro (menu principal), Seleção de Modo de Jogo, Leaderboard (placar), Simulador Financeiro (entry point), renderVals (view-model)

## Knowledge Gaps
- **26 isolated node(s):** `Propósito do jogo (nesta ordem)`, `Como rodar`, `Como testar`, ``engine/` — regras do jogo, zero UI`, ``Simulador Financeiro.dc.html` — orquestrador (entry point)` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderVals (view-model)` connect `rootNameForDocument` to `Regras do Jogo e Formatação`, `Placar Global (Supabase)`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `Component (Orquestrador do jogo)` connect `Conceitos Educacionais e Menu` to `Regras do Jogo e Formatação`, `Placar Global (Supabase)`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `Propósito do jogo (nesta ordem)`, `Como rodar`, `Como testar` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Config, Ativos, Eventos e Testes` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Componentes` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._