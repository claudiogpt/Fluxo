// Atalhos globais — porta a cadeia de guards do orquestrador DC:
// input/textarea → G (glossário) → ESC (fecha overlay / volta uma tela) →
// Space/Enter (modal) → Space/A (jogo).
// Sempre e.code OU e.key (eventos sintéticos/teclados não-QWERTY).
import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fecharMes, toggleAuto } from '../features/game/gameSlice';
import { cancelarModal, confirmarModal } from '../features/conceitos/thunks';
import {
  alternarGlossario,
  fecharGlossario,
  irPara,
  selectRota,
  voltar,
} from '../features/ui/uiSlice';

const ehTecla = (e: KeyboardEvent, code: string, ...keys: string[]) =>
  e.code === code || keys.includes(e.key);

export function useAtalhos() {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && /^(INPUT|TEXTAREA)$/.test(alvo.tagName)) return;
      const { game, conceitos, ui } = store.getState();

      // [G] leva ao glossário nos dois mundos, mas em formatos diferentes:
      // overlay durante a partida, página no menu (onde apertar de novo volta).
      if (ehTecla(e, 'KeyG', 'g', 'G')) {
        e.preventDefault();
        if (game.tela === 'jogo') dispatch(alternarGlossario());
        else if (selectRota({ ui }) === 'glossario') dispatch(voltar());
        else dispatch(irPara('glossario'));
        return;
      }
      if (ui.glossarioAberto) {
        if (ehTecla(e, 'Escape', 'Escape')) {
          e.preventDefault();
          dispatch(fecharGlossario());
        }
        return;
      }
      if (conceitos.modal) {
        if (ehTecla(e, 'Space', ' ') || ehTecla(e, 'Enter', 'Enter')) {
          e.preventDefault();
          dispatch(confirmarModal());
        } else if (ehTecla(e, 'Escape', 'Escape') && conceitos.modal.acaoPendente) {
          e.preventDefault();
          dispatch(cancelarModal());
        }
        return;
      }
      // No menu, ESC sobe um nível (no-op na home — a pilha nunca esvazia).
      if (game.tela !== 'jogo') {
        if (ehTecla(e, 'Escape', 'Escape')) {
          e.preventDefault();
          dispatch(voltar());
        }
        return;
      }
      if (game.fim) return;
      if (ehTecla(e, 'Space', ' ')) {
        e.preventDefault();
        dispatch(fecharMes());
      } else if (ehTecla(e, 'KeyA', 'a', 'A')) {
        e.preventDefault();
        dispatch(toggleAuto());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store, dispatch]);
}
