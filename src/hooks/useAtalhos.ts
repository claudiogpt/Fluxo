// Atalhos globais — porta a cadeia de guards do orquestrador DC:
// input/textarea → G/ESC (glossário) → Space/Enter (modal) → Space/A (jogo).
// Sempre e.code OU e.key (eventos sintéticos/teclados não-QWERTY).
import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fecharMes, toggleAuto } from '../features/game/gameSlice';
import { cancelarModal, confirmarModal } from '../features/conceitos/thunks';

const ehTecla = (e: KeyboardEvent, code: string, ...keys: string[]) =>
  e.code === code || keys.includes(e.key);

export function useAtalhos(glossarioAberto: boolean, setGlossarioAberto: (fn: (v: boolean) => boolean) => void) {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && /^(INPUT|TEXTAREA)$/.test(alvo.tagName)) return;
      if (ehTecla(e, 'KeyG', 'g', 'G')) {
        e.preventDefault();
        setGlossarioAberto((v) => !v);
        return;
      }
      if (glossarioAberto) {
        if (ehTecla(e, 'Escape', 'Escape')) {
          e.preventDefault();
          setGlossarioAberto(() => false);
        }
        return;
      }
      const { game, conceitos } = store.getState();
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
      if (game.tela !== 'jogo' || game.fim) return;
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
  }, [glossarioAberto, setGlossarioAberto, store, dispatch]);
}
