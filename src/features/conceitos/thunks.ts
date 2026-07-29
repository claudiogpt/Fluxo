// Porta do executarComConceito/confirmarModal/cancelarModal do orquestrador DC.
// A interceptação educacional: na 1ª vez que uma ação relevante acontece, o
// modal abre com a ação PENDENTE (serializável); confirmar marca o conceito
// visto e despacha a pendente. Abrir modal pausa o AUTO (como no DC).
import type { UnknownAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../../store';
import type { AtivoKey } from '../../engine/types';
import { catalogo, conceitos } from '../../engine';
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

/** Aporte com interceptação: o 1º aporte num ativo que carrega conceito pede o
 *  "entendi". A pendente guarda o PCT, não o valor: se o jogador demorar no
 *  modal, o montante é recalculado contra o caixa do momento em que confirma. */
export function aportarPctComConceito(key: AtivoKey, pct: number): Thunk {
  return (dispatch) => {
    const acao = aportarPct({ key, pct });
    const conceito = conceitoDoAtivo(key);
    if (pct > 0 && conceito) {
      dispatch(executarComConceito(conceito, acao));
      return;
    }
    dispatch(acao);
  };
}

/** Qual conceito educacional este ativo dispara no 1º aporte.
 *  Nos 5 clássicos a lista é fixa; no realista vem do próprio catálogo
 *  (`conceito` da definição) — senão o modo carro-chefe seria justamente o
 *  que menos ensina. Conceito sem tooltip cadastrado é ignorado. */
function conceitoDoAtivo(key: string): string | null {
  if (key === 'reserva' || key === 'acoes' || key === 'cripto') return key;
  const d = catalogo.def(key);
  return d && conceitos.tooltips[d.conceito] ? d.conceito : null;
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
