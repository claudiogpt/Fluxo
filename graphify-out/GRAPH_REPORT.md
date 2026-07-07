# Graph Report - .  (2026-07-07)

## Corpus Check
- Corpus is ~21,568 words - fits in a single context window. You may not need a graph.

## Summary
- 138 nodes · 258 edges · 13 communities
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 114,787 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Engine do Jogo (regras & estado)|Engine do Jogo (regras & estado)]]
- [[_COMMUNITY_Eventos & Testes do Engine|Eventos & Testes do Engine]]
- [[_COMMUNITY_Runtime de Componentes (ciclo de vida)|Runtime de Componentes (ciclo de vida)]]
- [[_COMMUNITY_Telas & Conceitos Financeiros|Telas & Conceitos Financeiros]]
- [[_COMMUNITY_Compilador de Templates DC|Compilador de Templates DC]]
- [[_COMMUNITY_Conceitos Desbloqueáveis|Conceitos Desbloqueáveis]]
- [[_COMMUNITY_Bootstrap & Parsing DC|Bootstrap & Parsing DC]]
- [[_COMMUNITY_Fábrica de Runtime|Fábrica de Runtime]]
- [[_COMMUNITY_Visão de Produto (propósito triplo)|Visão de Produto (propósito triplo)]]
- [[_COMMUNITY_Fábrica de Componentes & Lógica|Fábrica de Componentes & Lógica]]
- [[_COMMUNITY_Placar & Persistência|Placar & Persistência]]
- [[_COMMUNITY_Resolução de Expressões & Caminhos|Resolução de Expressões & Caminhos]]
- [[_COMMUNITY_Utilitários de Nomes DC|Utilitários de Nomes DC]]

## God Nodes (most connected - your core abstractions)
1. `Simulador Financeiro (orquestrador)` - 23 edges
2. `Fluxo — Simulador Financeiro FALÊNCIA ou LIBERDADE` - 14 edges
3. `createRuntime()` - 9 edges
4. `fecharMes()` - 8 edges
5. `walkChildren()` - 8 edges
6. `walk()` - 8 edges
7. `getReact()` - 7 edges
8. `boot()` - 7 edges
9. `resolve()` - 7 edges
10. `compileAttr()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Simulador Financeiro (orquestrador)` --calls--> `jaVisto()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/conceitos.js
- `Simulador Financeiro (orquestrador)` --calls--> `marcarVisto()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/conceitos.js
- `Simulador Financeiro (orquestrador)` --calls--> `fmt()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/formato.js
- `Simulador Financeiro (orquestrador)` --calls--> `fmtTempo()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/formato.js
- `Simulador Financeiro (orquestrador)` --calls--> `sparkline()`  [EXTRACTED]
  Simulador Financeiro.dc.html → engine/formato.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Camada de overlays modais fixos (position:fixed, z-index empilhado)** — conceitomodal_dc_conceitomodal, fimdejogo_dc_fimdejogo, glossario_dc_glossario [INFERRED 0.80]
- **Fluxo de desbloqueio de termos do glossário** — conceitomodal_dc_conceitomodal, glossario_dc_glossario, glossario_dc_volatilidade [INFERRED 0.80]
- **Condição de vitória: renda passiva supera custo de vida** — intro_dc_intro, fimdejogo_dc_fimdejogo, intro_dc_renda_passiva, intro_dc_custo_de_vida [INFERRED 0.80]
- **Propósito triplo do Fluxo (ensinar > simular > speedrun)** — readme_proposito_triplo, readme_ensinar_financas, readme_simulacao, readme_speedrun [EXTRACTED 1.00]
- **Orquestrador converte estado em view-model e alimenta as telas** — simulador_financeiro_dc, painelstatus_dc, negociocard_dc, terminaleventos_dc, leaderboard_dc [EXTRACTED 1.00]
- **Fluxo de dados do placar: engine/placar → orquestrador → Leaderboard** — engine_placar_ler, simulador_financeiro_dc, leaderboard_dc [EXTRACTED 1.00]

## Communities (13 total, 0 thin omitted)

### Community 0 - "Engine do Jogo (regras & estado)"
Cohesion: 0.13
Nodes (28): fmt(), fmtTempo(), sparkline(), addLog(), aportarNegocio(), chavesZeradas(), cobrir(), fecharMes() (+20 more)

### Community 1 - "Eventos & Testes do Engine"
Cohesion: 0.12
Nodes (14): assert, ativos, conceitos, config, eventos, formato, mesCripto(), placar (+6 more)

### Community 2 - "Runtime de Componentes (ciclo de vida)"
Cohesion: 0.12
Nodes (7): compileTemplate(), contentKey(), encodeCase(), isElementClass(), isRenderableType(), loadReactUmd(), loadScript()

### Community 3 - "Telas & Conceitos Financeiros"
Cohesion: 0.21
Nodes (16): AtivoCard (card de ativo com aporte/resgate), ConceitoModal (modal educacional de primeira vez), FimDeJogo (overlay FALIU / LIVRE), Juros Compostos, CDI, Glossario (painel de termos desbloqueáveis), Volatilidade, Comprar Financiado vs Alugar e Investir (+8 more)

### Community 4 - "Compilador de Templates DC"
Cohesion: 0.38
Nodes (12): collectProps(), compileAttr(), cssToObj(), hostPositionStyle(), kebabToCamel(), walk(), walkChildren(), walkComponent() (+4 more)

### Community 5 - "Conceitos Desbloqueáveis"
Cohesion: 0.67
Nodes (5): jaVisto(), marcarVisto(), storagePadrao(), termosDesbloqueados(), vistos()

### Community 6 - "Bootstrap & Parsing DC"
Cohesion: 0.40
Nodes (6): boot(), getReactDOM(), init(), parseDataProps(), parseDcDocument(), parseDcText()

### Community 7 - "Fábrica de Runtime"
Cohesion: 0.33
Nodes (6): createExternalModules(), createHelmetManager(), createPseudoSheet(), createRegistry(), createRuntime(), Placeholder()

### Community 8 - "Visão de Produto (propósito triplo)"
Cohesion: 0.40
Nodes (5): Ensinar finanças (propósito prioritário), Propósito triplo do jogo, Simulação da realidade de investimentos, Speedrun (timer, leaderboard, ranqueado), Speedrun ranqueado (seed compartilhada)

### Community 9 - "Fábrica de Componentes & Lógica"
Cohesion: 0.40
Nodes (5): createComponentFactory(), evalDcLogic(), getReact(), walkText(), warnUnresolved()

### Community 10 - "Placar & Persistência"
Cohesion: 0.83
Nodes (3): ler(), salvar(), storagePadrao()

### Community 11 - "Resolução de Expressões & Caminhos"
Cohesion: 0.50
Nodes (4): findTopLevelEquality(), parensWrapWhole(), resolve(), resolvePath()

### Community 12 - "Utilitários de Nomes DC"
Cohesion: 0.67
Nodes (3): dcNameFromPath(), rootNameForDocument(), safeDecode()

## Knowledge Gaps
- **14 isolated node(s):** `{ test }`, `assert`, `config`, `ativos`, `formato` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Simulador Financeiro (orquestrador)` connect `Engine do Jogo (regras & estado)` to `Placar & Persistência`, `Conceitos Desbloqueáveis`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `Fluxo — Simulador Financeiro FALÊNCIA ou LIBERDADE` connect `Engine do Jogo (regras & estado)` to `Visão de Produto (propósito triplo)`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Propósito triplo do jogo` connect `Visão de Produto (propósito triplo)` to `Engine do Jogo (regras & estado)`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `{ test }`, `assert`, `config` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Engine do Jogo (regras & estado)` be split into smaller, more focused modules?**
  _Cohesion score 0.12903225806451613 - nodes in this community are weakly interconnected._
- **Should `Eventos & Testes do Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.12105263157894737 - nodes in this community are weakly interconnected._
- **Should `Runtime de Componentes (ciclo de vida)` be split into smaller, more focused modules?**
  _Cohesion score 0.12280701754385964 - nodes in this community are weakly interconnected._