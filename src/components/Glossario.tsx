// Glossário flutuante — usado SÓ durante a partida, pra consultar um termo sem
// sair do jogo. No menu o glossário é uma página (components/menu/PaginaGlossario).
import type { CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import { selectContador } from '../features/conceitos/conceitosSlice';
import { RODAPE_GLOSSARIO, TermosGlossario } from './TermosGlossario';

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
  contador: { color: 'var(--sucesso)', fontSize: 11, marginLeft: 10 },
  fechar: {
    background: 'transparent',
    border: '1px solid var(--texto-apagado)',
    color: 'var(--texto-fraco)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    padding: '5px 12px',
    borderRadius: 3,
    cursor: 'pointer',
  },
  lista: { padding: '14px 20px', overflowY: 'auto', display: 'grid', gap: 10 },
  rodape: {
    padding: '10px 20px',
    borderTop: '1px solid var(--borda)',
    color: 'var(--texto-apagado)',
    fontSize: 10.5,
  },
} satisfies Record<string, CSSProperties>;

export function Glossario({ fechar }: { fechar: () => void }) {
  const contador = useSelector(selectContador);

  return (
    <div style={estilos.overlay}>
      <div style={estilos.painel}>
        <div style={estilos.cabecalho}>
          <div>
            <span style={estilos.titulo}>📖 GLOSSÁRIO</span>
            <span style={estilos.contador}>{contador}</span>
          </div>
          <button style={estilos.fechar} onClick={fechar}>
            FECHAR [ESC]
          </button>
        </div>
        <div style={estilos.lista}>
          <TermosGlossario />
        </div>
        <div style={estilos.rodape}>{RODAPE_GLOSSARIO}</div>
      </div>
    </div>
  );
}
