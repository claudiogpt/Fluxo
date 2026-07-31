// Diagnóstico da partida: o que, no estado final, explica o resultado.
//
// Mora aqui e não na tela de fim de jogo porque a regra é "causa → estudo", e
// causa → estudo é conteúdo. A UI só pega o primeiro que casar e renderiza.
//
// Duas regras de honestidade, nesta ordem de importância:
//   1. nenhum diagnóstico chuta. Não casou nada, a tela mostra só o fato.
//   2. nenhum diagnóstico julga. Constata o que aconteceu e oferece o texto.

import type { GameState } from '../engine/types';

export interface Diagnostico {
  id: string;
  /** condição sobre o estado FINAL da partida */
  quando: (s: GameState) => boolean;
  /** completa a frase "FALIU no mês 34 — ..." (minúscula, ponto final) */
  causa: string;
  /** id em ESTUDOS */
  estudo: string;
}

/** Primeiro que casar vence — do mais específico pro mais genérico. */
export const DIAGNOSTICOS: readonly Diagnostico[] = [
  {
    id: 'saque-em-queda',
    quando: (s) => s.fim === 'apos_faliu',
    causa: 'o patrimônio não aguentou os saques até o fim.',
    estudo: 'sequencia-de-retornos',
  },
  {
    id: 'venda-forcada',
    quando: (s) => s.fim === 'faliu' && !!s.liquidacaoNoMes,
    causa: 'o caixa não fechou e o jogo vendeu seus ativos com deságio.',
    estudo: 'liquidez-e-venda-forcada',
  },
  {
    id: 'sem-reserva',
    quando: (s) => s.fim === 'faliu' && (s.ativos.reserva ?? 0) < 1,
    causa: 'as contas venceram sem nenhuma reserva pra amortecer.',
    estudo: 'liquidez-e-venda-forcada',
  },
  {
    id: 'saque-sem-folga',
    quando: (s) => s.fim === 'desafio_falhou' && s.salario === 0,
    causa: 'viver do patrimônio custou mais do que ele repôs.',
    estudo: 'sequencia-de-retornos',
  },
];

export const diagnosticar = (s: GameState): Diagnostico | null =>
  DIAGNOSTICOS.find((d) => d.quando(s)) ?? null;
