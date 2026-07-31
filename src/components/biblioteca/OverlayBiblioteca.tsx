// A BIBLIOTECA sobre a mesa, durante a partida: consulta sem sair do jogo.
// No menu ela é uma página (menu/PaginaBiblioteca) — mesmo conteúdo, casca
// diferente. O jogo não pausa por causa disto: é overlay, não modal de regra.
import type { CSSProperties } from 'react';
import { BibliotecaConteudo } from './BibliotecaConteudo';

const estilos = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'var(--overlay)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 65,
    color: 'var(--texto)',
    lineHeight: 1.5,
  },
  painel: {
    maxWidth: 640,
    width: 'calc(100% - 48px)',
    maxHeight: '82vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--superficie)',
    border: '1px solid var(--borda)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cabecalho: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid var(--borda)',
    background: 'var(--superficie-2)',
  },
  titulo: { fontWeight: 700, letterSpacing: 1, color: 'var(--texto-forte)' },
  fechar: {
    background: 'transparent',
    border: '1px solid var(--texto-apagado)',
    color: 'var(--texto-fraco)',
    fontFamily: 'inherit',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    padding: '5px 12px',
    borderRadius: 3,
    cursor: 'pointer',
  },
  corpo: { padding: '14px 20px', overflowY: 'auto' },
} satisfies Record<string, CSSProperties>;

export function OverlayBiblioteca({ fechar }: { fechar: () => void }) {
  return (
    <div style={estilos.overlay}>
      <div style={estilos.painel}>
        <div style={estilos.cabecalho}>
          <span style={estilos.titulo}>📚 BIBLIOTECA</span>
          <button style={estilos.fechar} onClick={fechar}>
            FECHAR [ESC]
          </button>
        </div>
        <div style={estilos.corpo}>
          <BibliotecaConteudo />
        </div>
      </div>
    </div>
  );
}
