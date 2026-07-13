# Graph Report - Fluxo  (2026-07-13)

## Corpus Check
- 13 files · ~24,045 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 167 nodes · 273 edges · 25 communities (14 shown, 11 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d4eaa938`
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
- [[_COMMUNITY_Fluxo — Simulador Financeiro FALÊNCIA ou LIBERDADE|Fluxo — Simulador Financeiro FALÊNCIA ou LIBERDADE]]
- [[_COMMUNITY_Placar Global (Supabase)|Placar Global (Supabase)]]
- [[_COMMUNITY_Propósito Ensinar Finanças|Propósito: Ensinar Finanças]]
- [[_COMMUNITY_Aleatoriedade Injetável (rng por parâmetro)|Aleatoriedade Injetável (rng por parâmetro)]]
- [[_COMMUNITY_Cálculo de Score do Ranking|Cálculo de Score do Ranking]]
- [[_COMMUNITY_Speedrun (timer + placar em todos os modos)|Speedrun (timer + placar em todos os modos)]]
- [[_COMMUNITY_Telas Só-Template (componentes .dc.html)|Telas Só-Template (componentes *.dc.html)]]
- [[_COMMUNITY_rootNameForDocument|rootNameForDocument]]

## God Nodes (most connected - your core abstractions)
1. `renderVals (view-model)` - 10 edges
2. `createRuntime()` - 9 edges
3. `walkChildren()` - 8 edges
4. `walk()` - 8 edges
5. `Component (Orquestrador do jogo)` - 8 edges
6. `fecharMes()` - 7 edges
7. `getReact()` - 7 edges
8. `boot()` - 7 edges
9. `resolve()` - 7 edges
10. `compileAttr()` - 7 edges

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
- **Fluxo do Placar Global (nick → jogo → score → ranking)** — intro_dc_nickname_input, simulador_financeiro_dc_registrarplacar, simulador_financeiro_dc_carregarplacar, leaderboard_dc, readme_placar_global [EXTRACTED 1.00]
- **Camada educacional de conceitos (modais de primeira vez)** — readme_proposito_ensinar_financas, simulador_financeiro_dc_executarcomconceito, simulador_financeiro_dc_verificarconceitosdeestado [INFERRED 0.85]

## Communities (25 total, 11 thin omitted)

### Community 0 - "Regras do Jogo e Formatação"
Cohesion: 0.23
Nodes (12): addLog(), chavesZeradas(), cobrir(), fecharMes(), ganhoReinvestimento(), novoJogo(), parcelaFinanciamento(), patrimonio() (+4 more)

### Community 1 - "Config, Ativos, Eventos e Testes"
Cohesion: 0.11
Nodes (14): assert, ativos, conceitos, config, eventos, formato, mesCripto(), placar (+6 more)

### Community 2 - "Conceitos Educacionais e Menu"
Cohesion: 0.24
Nodes (12): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos(), mover(), Nickname Input (Placar Global), Arquitetura em Três Camadas (+4 more)

### Community 3 - "Runtime DC: Componentes"
Cohesion: 0.13
Nodes (6): compileTemplate(), encodeCase(), isElementClass(), isRenderableType(), loadReactUmd(), loadScript()

### Community 4 - "Placar Global (Supabase)"
Cohesion: 0.23
Nodes (18): boardDe(), cabecalhos(), cfgPadrao(), enviarRemoto(), ler(), lerRemoto(), nick(), nomeLimpo() (+10 more)

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

### Community 24 - "rootNameForDocument"
Cohesion: 0.67
Nodes (3): dcNameFromPath(), rootNameForDocument(), safeDecode()

## Knowledge Gaps
- **27 isolated node(s):** `{ test }`, `assert`, `config`, `ativos`, `formato` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderVals (view-model)` connect `rootNameForDocument` to `Regras do Jogo e Formatação`, `Placar Global (Supabase)`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Component (Orquestrador do jogo)` connect `Conceitos Educacionais e Menu` to `Regras do Jogo e Formatação`, `Placar Global (Supabase)`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `patrimonio()` connect `Regras do Jogo e Formatação` to `rootNameForDocument`, `Placar Global (Supabase)`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `{ test }`, `assert`, `config` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Config, Ativos, Eventos e Testes` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._
- **Should `Runtime DC: Componentes` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._