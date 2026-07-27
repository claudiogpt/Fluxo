// Glossário — primeira tela convertida do DC pro React (PASSO 3).
// Visual portado 1:1 do Glossario do protótipo DC (git history); os dados vêm do conceitosSlice
// (selectors), sem prop-drilling: o único prop é o callback de fechar.
import type { CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import {
  selectContador,
  selectGlossarioLista,
} from '../features/conceitos/conceitosSlice';

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
  linha: {
    border: '1px solid var(--borda-suave)',
    background: 'var(--fundo)',
    borderRadius: 6,
    padding: '10px 14px',
    display: 'flex',
    gap: 12,
    alignItems: 'baseline',
  },
  rodape: {
    padding: '10px 20px',
    borderTop: '1px solid var(--borda)',
    color: 'var(--texto-apagado)',
    fontSize: 10.5,
  },
} satisfies Record<string, CSSProperties>;

export function Glossario({ fechar }: { fechar: () => void }) {
  const lista = useSelector(selectGlossarioLista);
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
          {lista.map((t) => (
            <div key={t.id} style={estilos.linha}>
              <span style={{ flex: 'none' }}>{t.icone}</span>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 0.5,
                    color: t.desbloqueado ? 'var(--texto-forte)' : 'var(--texto-apagado)',
                  }}
                >
                  {t.nome}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: t.desbloqueado ? 'var(--texto-fraco)' : 'var(--texto-apagado)',
                    marginTop: 2,
                  }}
                >
                  {t.definicao}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={estilos.rodape}>
          termos destravam quando o conceito aparece no jogo — jogue os modos e cenários pra
          completar
        </div>
      </div>
    </div>
  );
}
