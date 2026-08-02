// Atalhos globais — porta a cadeia de guards do orquestrador DC, agora com a
// biblioteca no lugar do glossário:
// input/textarea → ? (manual da tela) → G (biblioteca) → dentro da biblioteca
// (1/2/3 e ESC) → L (ler o estudo oferecido) → T/X (convite do tutorial) →
// Space/Enter (modal) → ESC (volta uma tela) → Space/A (jogo).
// Sempre e.code OU e.key (eventos sintéticos/teclados não-QWERTY).
import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fecharMes, toggleAuto } from '../features/game/gameSlice';
import { cancelarModal, confirmarModal } from '../features/conceitos/thunks';
import {
  PRATELEIRAS,
  abrirEstudo,
  abrirPrateleira,
  dispensarConvite,
  fecharEstudo,
  selectConviteTutorial,
  selectDiagnostico,
  selectHint,
} from '../features/biblioteca';
import { abrirAjuda } from '../features/ui/ajuda';
import { jogarTutorial } from '../features/ui/thunks';
import {
  alternarBiblioteca,
  fecharBiblioteca,
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
      const estado = store.getState();
      const { game, conceitos, ui, biblioteca } = estado;

      // [?] abre o manual na seção da tela atual, de qualquer lugar.
      if (e.key === '?') {
        e.preventDefault();
        dispatch(abrirAjuda());
        return;
      }

      // [G] leva à biblioteca nos dois mundos, mas em formatos diferentes:
      // overlay durante a partida, página no menu (onde apertar de novo volta).
      if (ehTecla(e, 'KeyG', 'g', 'G')) {
        e.preventDefault();
        if (game.tela === 'jogo') dispatch(alternarBiblioteca());
        else if (selectRota({ ui }) === 'biblioteca') dispatch(voltar());
        else dispatch(irPara('biblioteca'));
        return;
      }

      // Na PÁGINA da biblioteca os números também valem: o fichário mostra as
      // mesmas abas 01/02/03, e a numeração na tela é o atalho. O ESC não
      // entra aqui — quem cuida dele no menu é o `voltar` lá embaixo.
      // (O campo de busca está a salvo: a guarda de INPUT já saiu no topo.)
      if (game.tela !== 'jogo' && selectRota({ ui }) === 'biblioteca') {
        const n = Number(e.key);
        if (n >= 1 && n <= PRATELEIRAS.length) {
          e.preventDefault();
          dispatch(abrirPrateleira(PRATELEIRAS[n - 1]));
          return;
        }
      }

      // Dentro da biblioteca (overlay), o teclado é dela: os números são as
      // prateleiras — a mesma numeração 01/02/03 que está na tela.
      if (ui.bibliotecaAberta) {
        const n = Number(e.key);
        if (n >= 1 && n <= PRATELEIRAS.length) {
          e.preventDefault();
          dispatch(abrirPrateleira(PRATELEIRAS[n - 1]));
        } else if (ehTecla(e, 'Escape', 'Escape')) {
          e.preventDefault();
          // ESC volta um nível: do estudo pra lista, da lista pro jogo.
          if (biblioteca.estudoAberto) dispatch(fecharEstudo());
          else dispatch(fecharBiblioteca());
        }
        return;
      }

      // [L] é sempre "ler o que está sendo oferecido AGORA": o hint do rodapé
      // durante o mês, o diagnóstico depois da derrota. Uma tecla, dois
      // momentos — nunca duas teclas pra mesma coisa.
      if (ehTecla(e, 'KeyL', 'l', 'L')) {
        const oferta = selectDiagnostico(estado)?.estudo ?? selectHint(estado)?.estudo;
        if (oferta) {
          e.preventDefault();
          dispatch(abrirEstudo(oferta.id));
          if (game.tela === 'jogo') dispatch(alternarBiblioteca());
          else dispatch(irPara('biblioteca'));
          return;
        }
      }

      // O convite do tutorial vive só na home da primeira sessão. As teclas
      // existem enquanto a linha existe — some a linha, somem as teclas.
      if (game.tela !== 'jogo' && selectRota({ ui }) === 'home' && selectConviteTutorial(estado)) {
        if (ehTecla(e, 'KeyT', 't', 'T')) {
          e.preventDefault();
          dispatch(jogarTutorial());
          return;
        }
        if (ehTecla(e, 'KeyX', 'x', 'X')) {
          e.preventDefault();
          dispatch(dispensarConvite());
          return;
        }
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
