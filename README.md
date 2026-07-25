# Fluxo — Simulador Financeiro "FALÊNCIA ou LIBERDADE"

Jogo de educação financeira por turnos: cada turno é um mês, o custo de vida drena o caixa, e o objetivo é fazer a renda passiva superar o custo de vida antes de falir.

## Propósito do jogo (nesta ordem)

1. **Ensinar finanças** — prioritário. Cada mecânica e evento deve deixar uma lição real de finanças pessoais/investimentos.
2. **Simulação** — secundário. A tendência é simular cada vez mais a realidade de investimentos, com decisões mais intricadas de tipos de investimento.
3. **Speedrun** — diversão/monetização. Timer e placar global em **todos os modos**. Sem seed compartilhada, de propósito: o jogo é não determinístico e a sorte (e jogar de novo) faz parte da corrida.

> **⚠ MIGRAÇÃO EM CURSO (branch `migracao-react-vite`)**: o jogo está sendo migrado do
> runtime DC pra **React 18 + Vite + TypeScript + Redux Toolkit**, de forma incremental.
> O app novo vive em `src/`; o protótipo DC continua funcional em paralelo, **congelado**
> (nenhuma feature nova nele) até o cutover, quando será deletado. A regra de ouro vale
> pros dois: `engine/*.js` é a fonte única das regras e não muda na migração.

## Como rodar

**App React (em migração — desenvolvimento acontece aqui):**

```bash
npm install
npm run dev        # Vite em http://localhost:5173
```

**Protótipo DC (legado, congelado):** abra a pasta no VSCode, suba o **Live Server** e acesse
`Simulador Financeiro.dc.html` (ou use o próprio Vite: `http://localhost:5173/Simulador%20Financeiro.dc.html`).
Precisa ser via HTTP — as telas são carregadas por `fetch`, `file://` não funciona.

Os dois apps compartilham o progresso educacional (mesma chave `fluxo_conceitos_v1` no localStorage).

## Como testar

```bash
node --test        # engine (regras do jogo) — zero dependências, rng injetado
npx vitest run     # app React (slices + componentes)
npx tsc --noEmit   # type-check
```

## Arquitetura

Três camadas, acopladas só por contratos simples. Durante a migração existem **duas cascas**
sobre o mesmo engine:

```
                        ┌→ src/ (React, NOVO): engine shim → slices RTK → componentes .tsx
engine/ (regras puras) ─┤
                        └→ Simulador Financeiro.dc.html (DC, LEGADO congelado) → *.dc.html
```

### `src/` — app React (o futuro)

| Pasta | Responsabilidade |
|---|---|
| `src/engine/` | Shim tipado do engine UMD: importa os `engine/*.js` e expõe `Fluxo.*` com tipos (funciona no browser E no Vitest/Node). |
| `src/store/` | `configureStore` + listener middleware (persistência e efeitos). |
| `src/features/` | Slices RTK + selectors (o view-model `renderVals` do DC vira selectors aqui). `conceitos/` = fonte única do conteúdo educacional. |
| `src/components/` | Telas convertidas 1:1 dos `.dc.html` (só apresentação). |
| `src/views/` | Composições de tela. |

Status da conversão: **Glossário ✓** · demais telas pendentes (ver plano da migração).

### `engine/` — regras do jogo, zero UI

Funções puras sobre um objeto de estado plano. Cada arquivo expõe um módulo em `window.Fluxo.*` no browser e via `module.exports` no Node (para os testes).

| Arquivo | Responsabilidade |
|---|---|
| `config.js` | Todo o balanceamento: dificuldades, inflação, chance de evento, ordem/deságios da liquidação forçada. |
| `ativos.js` | Definição dos 5 ativos (retorno, volatilidade, dividendo, risco, textos). |
| `eventos.js` | Tabela de eventos aleatórios com pesos + sorteio. |
| `regras.js` | O coração: `novoJogo`, `fecharMes` (resolve um turno), `mover` (aporte/resgate), `cobrir` (liquidação em cascata), `rendaPassiva`, `patrimonio`. |
| `formato.js` | `fmt` (R$), `fmtCompacto`, `fmtTempo`, `sparkline`. |
| `placar.js` | Placar global: um board por modo, envio/leitura no Supabase via REST (`fetch` injetável) e fallback em `localStorage`. |

A aleatoriedade entra por parâmetro (`rng`), nunca por `Math.random` fixo — é isso que torna as regras testáveis.

### `Simulador Financeiro.dc.html` — orquestrador DC (LEGADO, entry point do protótipo)

Único componente com estado. Guarda o estado do jogo, escuta teclado/timer, delega cada ação ao engine e converte o estado em view-model (`renderVals`) para as telas. Nenhuma regra de negócio aqui.

### Telas — componentes `*.dc.html` só-template (LEGADO; referência visual da conversão)

Recebem tudo por props (strings prontas, cores e callbacks); não têm estado nem lógica. O contrato de props está comentado no topo de cada arquivo.

| Componente | O que mostra |
|---|---|
| `Intro.dc.html` | Menu principal: modos, dificuldade, cenários e configurações. |
| `PainelStatus.dc.html` | Cabeçalho, cards de indicadores e barra de progresso/fase. |
| `AtivoCard.dc.html` | Um ativo com botões de aporte/resgate. |
| `NegocioCard.dc.html` | A empresa do modo empresário (reinvestir/sacar/aportar giro). |
| `ImovelCard.dc.html` | A moradia do cenário imóveis + corrida tijolo vs carteira. |
| `TerminalEventos.dc.html` | Log de eventos do jogo. |
| `Leaderboard.dc.html` | Placar. |
| `FimDeJogo.dc.html` | Overlay de fim (FALIU/LIVRE/cenários). |
| `ConceitoModal.dc.html` | Modal educacional de primeira vez (conceitos). |
| `Glossario.dc.html` | Glossário com termos bloqueados/desbloqueados e contador. |

**Dica de desenvolvimento ágil:** cada tela pode ser aberta sozinha no Live Server (ex.: `AtivoCard.dc.html`) — ela renderiza com dados de exemplo definidos no `data-props` do próprio arquivo. Dá pra ajustar o visual de uma tela sem rodar o jogo inteiro.

### Suporte

- `support.js` — runtime DC (gerado, **não editar**).
- `tema.css` — estilos globais compartilhados (fonte, fundo, animações `piscar`/`surgir`).

## Placar global (Supabase)

Todos os modos têm um placar. Sem configuração ele é **local** (localStorage do dispositivo); com um projeto Supabase gratuito ele vira **global** (ranking mundial). Como ligar:

1. Crie um projeto em [supabase.com](https://supabase.com) (plano free).
2. No **SQL Editor** do projeto, rode:

```sql
create table placar (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome text not null check (char_length(nome) between 1 and 16),
  modo text not null check (modo in ('classico','sandbox','empresario','aposentadoria','imoveis')),
  detalhe text not null default '',
  dificuldade text not null check (dificuldade in ('normal','hardcore')),
  resultado text not null,
  meses int not null check (meses between 0 and 9999),
  pat bigint not null,
  tempo int not null check (tempo >= 0),
  score bigint not null
);
create index placar_board on placar (modo, score desc);

alter table placar enable row level security;
create policy "leitura publica" on placar for select using (true);
create policy "insercao publica" on placar for insert with check (true);
```

3. Em **Project Settings → API**, copie a **URL** e a **anon key** e cole em `engine/config.js` → `placarOnline`. A anon key é pública por design — o RLS acima só permite ler e inserir, nunca editar/apagar.
4. **Blindagem** (recomendado): rode também [`supabase/hardening.sql`](supabase/hardening.sql) no SQL Editor. Ele adiciona um trigger que recalcula o `score` no servidor e rejeita inserts forjados/inconsistentes, valida os pares (modo, resultado, detalhe) que o jogo realmente produz, bloqueia caracteres de controle no nome e revoga UPDATE/DELETE no nível de GRANT (além do RLS). Nota: SQL injection clássica não se aplica aqui — o PostgREST parametriza as queries; o risco real era insert forjado, e é isso que o trigger fecha.

Como o ranking funciona: cada partida gera um `score` (maior = melhor) calculado no `placar.js` — vitória sempre vence derrota; clássico/empresário/sandbox premiam **menos meses** (tempo real desempata); aposentadoria/imóveis premiam **patrimônio final**. O board consulta `order=score.desc` direto no banco.

## Receitas rápidas

- **Mudar balanceamento** (dificuldade, inflação, deságios): `engine/config.js`.
- **Adicionar um modo de jogo**: entre em `engine/config.js` (`modos`) com `disponivel: false` — ele já aparece no menu como "EM BREVE". Quando a mecânica existir, ligue `disponivel: true` e trate o `state.modo` no orquestrador/engine. O placar do modo novo é automático se ele terminar com `s.fim`; ajuste o `scoreDe` em `engine/placar.js` se a métrica não for "menos meses".
- **Adicionar um conceito educacional**: nova entrada em `engine/conceitos.js` (`tooltips` para o modal de primeira vez, `termos` para o glossário) + o gatilho no orquestrador (interceptar ação com `executarComConceito(id, acao)` ou checar em `verificarConceitosDeEstado`).
- **Adicionar um ativo**: acrescente em `engine/ativos.js` (e na ordem de liquidação em `config.js` se quiser que ele cubra déficit). A UI o exibe automaticamente.
- **Adicionar um evento aleatório**: acrescente um item com peso `p` e `run` em `engine/eventos.js`.
- **Mexer no visual de uma tela**: edite o `*.dc.html` correspondente e abra-o isolado no Live Server.
- **Nova regra de turno**: `engine/regras.js` (`fecharMes`) + um teste em `tests/engine.test.js`.
