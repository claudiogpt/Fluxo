// Glossário — primeira tela convertida do DC pro React (PASSO 3).
// Visual portado 1:1 do Glossario do protótipo DC (git history); os dados vêm do conceitosSlice
// (selectors), sem prop-drilling: o único prop é o callback de fechar.
import type { CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import {
  selectContador,
  selectGlossarioLista,
} from '../features/conceitos/conceitosSlice';

const mono = "'IBM Plex Mono', monospace";

const estilos = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5,8,11,.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 65,
    color: '#d7e1ea',
    fontFamily: mono,
    lineHeight: 1.5,
  },
  painel: {
    maxWidth: 640,
    width: 'calc(100% - 48px)',
    maxHeight: '82vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0d1117',
    border: '1px solid #1e2833',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cabecalho: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid #1e2833',
    background: '#11161d',
  },
  titulo: { fontWeight: 700, letterSpacing: 1, color: '#f2f7fb' },
  contador: { color: '#22d47e', fontSize: 11, marginLeft: 10 },
  fechar: {
    background: 'transparent',
    border: '1px solid #3a4a5a',
    color: '#8fa1b2',
    fontFamily: mono,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    padding: '5px 12px',
    borderRadius: 3,
    cursor: 'pointer',
  },
  lista: { padding: '14px 20px', overflowY: 'auto', display: 'grid', gap: 10 },
  linha: {
    border: '1px solid #1a222c',
    background: '#0b0f14',
    borderRadius: 6,
    padding: '10px 14px',
    display: 'flex',
    gap: 12,
    alignItems: 'baseline',
  },
  rodape: {
    padding: '10px 20px',
    borderTop: '1px solid #1e2833',
    color: '#3a4a5a',
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
                    color: t.desbloqueado ? '#f2f7fb' : '#3a4a5a',
                  }}
                >
                  {t.nome}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: t.desbloqueado ? '#8fa1b2' : '#3a4a5a',
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
