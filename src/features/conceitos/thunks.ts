// Porta do executarComConceito/confirmarModal/cancelarModal do orquestrador DC.
// A interceptação educacional: na 1ª vez que uma ação relevante acontece, o
// modal abre com a ação PENDENTE (serializável); confirmar marca o conceito
// visto e despacha a pendente. Abrir modal pausa o AUTO (como no DC).
import type { UnknownAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../../store';
import type { AtivoKey } from '../../engine/types';
import { aportarPct, comecar, setAuto } from '../game/gameSlice';
import { abrirModal, fecharModal, marcarVisto } from './conceitosSlice';

type Thunk = (dispatch: AppDispatch, getState: () => RootState) => void;

/** 1ª vez: abre o modal com a ação pendente; depois disso, executa direto. */
export function executarComConceito(id: string, acaoPendente?: UnknownAction): Thunk {
  return (dispatch, getState) => {
    if (getState().conceitos.vistos.includes(id)) {
      if (acaoPendente) dispatch(acaoPendente);
      return;
    }
    dispatch(setAuto(false));
    dispatch(abrirModal({ id, acaoPendente }));
  };
}

/** Aporte com interceptação: 1º aporte em reserva/ações/cripto pede o "entendi".
 *  A pendente guarda o PCT, não o valor: se o jogador demorar no modal, o
 *  montante é recalculado contra o caixa do momento em que ele confirma. */
export function aportarPctComConceito(key: AtivoKey, pct: number): Thunk {
  return (dispatch) => {
    const acao = aportarPct({ key, pct });
    if (pct > 0 && (key === 'reserva' || key === 'acoes' || key === 'cripto')) {
      dispatch(executarComConceito(key, acao));
      return;
    }
    dispatch(acao);
  };
}

/** Começar partida: no cenário imóveis o custo de oportunidade vem ANTES da decisão. */
export function comecarComConceito(): Thunk {
  return (dispatch, getState) => {
    if (getState().game.imoveis) {
      dispatch(executarComConceito('moradia', comecar()));
      return;
    }
    dispatch(comecar());
  };
}

export function confirmarModal(): Thunk {
  return (dispatch, getState) => {
    const m = getState().conceitos.modal;
    if (!m) return;
    dispatch(marcarVisto(m.id));
    dispatch(fecharModal());
    if (m.acaoPendente) dispatch(m.acaoPendente);
  };
}

export function cancelarModal(): Thunk {
  return (dispatch) => {
    dispatch(fecharModal());
  };
}
