// Shell do jogo: intro | jogo + overlays (fim, modal educacional, biblioteca).
// Porta a composição do orquestrador DC.
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Ajuda } from './components/biblioteca/Ajuda';
import { OverlayBiblioteca } from './components/biblioteca/OverlayBiblioteca';
import { ConceitoModal } from './components/ConceitoModal';
import { FimDeJogo } from './components/FimDeJogo';
import { MenuRouter } from './components/menu/MenuRouter';
import { placar } from './engine';
import { selectContadorGlossario } from './features/biblioteca';
import { selectGame, selectTela } from './features/game/selectors';
import { carregarPlacar } from './features/placar/placarSlice';
import { alternarBiblioteca, fecharBiblioteca, selectBibliotecaAberta } from './features/ui/uiSlice';
import { useAtalhos } from './hooks/useAtalhos';
import { useGameLoop } from './hooks/useGameLoop';
import { usePrefs } from './hooks/usePrefs';
import { GameView } from './views/GameView';
import type { AppDispatch } from './store';

export function App() {
  const tela = useSelector(selectTela);
  const game = useSelector(selectGame);
  const contador = useSelector(selectContadorGlossario);
  const dispatch = useDispatch<AppDispatch>();
  const bibliotecaAberta = useSelector(selectBibliotecaAberta);
  const emJogo = tela === 'jogo';

  useGameLoop();
  useAtalhos();
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
      {tela === 'intro' ? <MenuRouter /> : <GameView />}

      {/* A biblioteca flutuante existe só DURANTE a partida: é consulta rápida
          sem sair da mesa. No menu ela é uma página (rota 'biblioteca').
          Em tela estreita o tema.css esconde este botão — lá ela fica no
          cabeçalho, ao lado do MENU (PainelStatus), pra não pairar sobre o
          jogo. O `[G]` continua abrindo nos dois casos, é a mesma action. */}
      {emJogo && (
        <div className="biblioteca-flutuante" style={{ position: 'fixed', right: 16, zIndex: 70 }}>
          <button
            onClick={() => dispatch(alternarBiblioteca())}
            style={{ background: 'var(--superficie)', border: '1px solid var(--borda)', color: 'var(--texto-fraco)', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, padding: '8px 14px', borderRadius: 20, cursor: 'pointer', boxShadow: 'var(--sombra-flutuante)' }}
          >
            📚 {contador} [G]
          </button>
        </div>
      )}

      {emJogo && bibliotecaAberta && <OverlayBiblioteca fechar={() => dispatch(fecharBiblioteca())} />}
      <ConceitoModal />
      <FimDeJogo />
      {/* O `?` é global: toda tela tem uma seção de manual que responde por ela. */}
      <Ajuda />
    </div>
  );
}
