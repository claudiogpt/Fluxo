# Guia de docstrings — Fluxo (Google-style híbrido)

Documentação por função para humanos e IDEs. O README descreve a **arquitetura**; este guia descreve o **contrato de cada função**.

## Idioma

| Parte | Idioma |
|-------|--------|
| 1ª linha (resumo) | Português, imperativo (~80 chars) |
| Corpo (contexto, armadilhas) | Português, 1–3 frases |
| Tags `@param`, `@returns`, `@throws`, `@example` | Rótulos em inglês; descrições técnicas curtas em inglês |
| `@example` | Código executável; comentários opcionais em PT |

## Template

```javascript
/**
 * Cria um estado inicial de partida a partir das escolhas do menu.
 *
 * Monta caixa, salário e sub-estados (aposentadoria, imóveis, empresário)
 * conforme modo e cenário. A partida começa com `tela: 'intro'`.
 *
 * @param {NovoJogoProps} [props] - Menu choices (difficulty, mode, capital).
 * @returns {GameState} Fresh game state ready for `comecar`.
 *
 * @example
 * const s = novoJogo({ dificuldade: 'hardcore', modo: 'classico' });
 */
```

### TypeScript (tipos redundantes)

Em arquivos `.ts` com tipos explícitos, omita `{Type}` nas tags quando o compilador já informa:

```typescript
/**
 * Converte percentual do trilho em valor absoluto em reais.
 *
 * 100% devolve a base exata; abaixo disso trunca pra baixo em reais inteiros.
 *
 * @param base - Amount in BRL to apply percentage against.
 * @param pct - Percentage 0–100 from the allocation slider.
 * @returns Rounded BRL amount to move.
 */
export function valorDePct(base: number, pct: number): number
```

## O que documentar

| Sim | Não |
|-----|-----|
| Funções exportadas do `engine/` | Getters triviais de 1 linha (`selectGame`) |
| Helpers exportados (`valorDePct`, `corDoEngine`) | Constantes puras (`TEMAS`, `MAPA_COR_ENGINE`) |
| Selectors `createSelector` exportados | Reducers RTK individuais (use `@module` no slice) |
| Thunks e hooks | Arquivos `*.test.*` |
| Interfaces em `types.ts` | Campos óbvios de dados estáticos |
| Efeitos em `listeners.ts` (1 bloco por listener) | |

## Reducers RTK

Documente o arquivo com `@module` listando as actions e suas regras. Exemplo:

```typescript
/**
 * @module gameSlice
 * Estado da partida no Redux. Reducers embrulham o engine (clone → call → merge).
 *
 * Actions principais:
 * - `fecharMes` — avança um turno; aceita `{ rng }` injetável em testes.
 * - `mover` / `aportarPct` / `resgatarPct` — alocação entre caixa e ativos.
 * - `comecar` — transição menu → jogo; grava `inicioTs`.
 */
```

## Engine JS e tipos

O `engine/` não entra no `tsconfig`. Use `@typedef` de [`engine/typedefs.jsdoc.js`](../engine/typedefs.jsdoc.js):

```javascript
/** @typedef {import('./typedefs.jsdoc').GameState} GameState */
```

O contrato TypeScript espelhado vive em [`src/engine/types.ts`](../src/engine/types.ts).

## Exemplos bons vs ruins

**Bom** — responde o que, quando e quem faz merge:

> Move valor entre caixa e um ativo. Ignora movimentos &lt; R$ 1. Retorna parcial para merge — `{}` = no-op.

**Ruim** — repete o código:

> Recebe s, key e valor e chama Math.min.

## Onde ler mais

- [`README.md`](../README.md) — arquitetura e receitas rápidas
- [`GUIA-FLUXOS.md`](GUIA-FLUXOS.md) — trilhas de leitura humana (fechar mês, aporte, placar)
