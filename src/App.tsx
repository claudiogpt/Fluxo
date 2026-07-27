// Shell do jogo: intro | jogo + overlays (fim, modal educacional, glossário).
// Porta a composição do orquestrador DC.
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConceitoModal } from './components/ConceitoModal';
import { FimDeJogo } from './components/FimDeJogo';
import { Glossario } from './components/Glossario';
import { Intro } from './components/Intro';
import { placar } from './engine';
import { selectContador } from './features/conceitos/conceitosSlice';
import { selectGame, selectTela } from './features/game/selectors';
import { carregarPlacar } from './features/placar/placarSlice';
import { useAtalhos } from './hooks/useAtalhos';
import { useGameLoop } from './hooks/useGameLoop';
import { usePrefs } from './hooks/usePrefs';
import { GameView } from './views/GameView';
import type { AppDispatch } from './store';

export function App() {
  const tela = useSelector(selectTela);
  const game = useSelector(selectGame);
  const contador = useSelector(selectContador);
  const dispatch = useDispatch<AppDispatch>();
  const [glossarioAberto, setGlossarioAberto] = useState(false);

  useGameLoop();
  useAtalhos(glossarioAberto, setGlossarioAberto);
  usePrefs();

  // Board atual (muda com modo/cenário): busca o top global (no-op offline).
  // `tela` na dependência dá retry natural nas transições menu↔jogo — se a
  // primeira busca falhou (ex.: projeto Supabase acordando), a próxima pega.
  const board = placar.boardDe(game);
  useEffect(() => {
    dispatch(carregarPlacar(board));
  }, [board, tela, dispatch]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fundo)', color: 'var(--texto)', fontSize: 13, lineHeight: 1.5 }}>
      {tela === 'intro' ? <Intro /> : <GameView />}

      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 70 }}>
        <button
          onClick={() => setGlossarioAberto((v) => !v)}
          style={{ background: 'var(--superficie)', border: '1px solid var(--borda)', color: 'var(--texto-fraco)', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, padding: '8px 14px', borderRadius: 20, cursor: 'pointer', boxShadow: 'var(--sombra-flutuante)' }}
        >
          📖 {contador} [G]
        </button>
      </div>

      {glossarioAberto && <Glossario fechar={() => setGlossarioAberto(false)} />}
      <ConceitoModal />
      <FimDeJogo />
    </div>
  );
}
