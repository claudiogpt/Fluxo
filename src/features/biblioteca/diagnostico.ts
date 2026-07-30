// O gancho de conversão é a DERROTA, não o menu: é ali que o jogador quer
// saber o que aconteceu. Este selector transforma o estado final em duas
// linhas — o que foi, e como aquilo se chama lá fora.
//
// A causa vem da tabela DIAGNOSTICOS (dados), nunca de um `if` aqui: nenhuma
// condição de derrota deve estar escrita em dois lugares. E quando nenhuma
// regra casa, devolvemos `null` na causa em vez de inventar uma — palpite
// errado sobre por que alguém quebrou é pior do que silêncio.
import { createSelector } from '@reduxjs/toolkit';
import { ESTUDOS, TERMOS, diagnosticar } from '../../conteudo';
import type { GameState } from '../../engine/types';

type ComGame = { game: GameState };

export const selectDiagnostico = createSelector(
  [(s: ComGame) => s.game],
  (s) => {
    if (!s.fim) return null;
    const d = diagnosticar(s);
    if (!d) return null;
    const e = ESTUDOS.find((x) => x.id === d.estudo);
    if (!e) return { mes: s.mes, causa: d.causa, estudo: null };
    return {
      mes: s.mes,
      causa: d.causa,
      estudo: {
        id: e.id,
        tempoLeituraMin: e.tempoLeituraMin,
        // o NOME do conceito, não o título do estudo: a frase é "isso tem
        // nome: sequência de retornos", e nome é coisa do glossário.
        conceito: TERMOS[e.conceitoPrincipal]?.nome.toLowerCase() ?? e.titulo.toLowerCase(),
      },
    };
  }
);
