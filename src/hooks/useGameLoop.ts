// Loop do jogo: porta o tick de 500ms do orquestrador DC — atualiza o relógio
// e, no AUTO, fecha o mês. O AUTO roda direto até o fim da simulação (decisão
// do Cláudio: eventos são acidentes inescapáveis); modal educacional pausa via
// setAuto(false) no momento em que abre.
import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fecharMes, tick } from '../features/game/gameSlice';

export function useGameLoop() {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const id = setInterval(() => {
      const { game, conceitos } = store.getState();
      if (game.tela !== 'jogo' || game.fim || !game.inicioTs) return;
      dispatch(tick(Date.now()));
      if (game.auto && !conceitos.modal) dispatch(fecharMes());
    }, 500);
    return () => clearInterval(id);
  }, [store, dispatch]);
}
