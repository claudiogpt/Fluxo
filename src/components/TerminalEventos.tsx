// Terminal de eventos (log) — portado 1:1 de TerminalEventos.dc.html.
import { useSelector } from 'react-redux';
import { selectLog } from '../features/game/selectors';

export function TerminalEventos() {
  const log = useSelector(selectLog);
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2833', borderRadius: 6, overflow: 'hidden', color: '#d7e1ea', fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.5 }}>
      <div style={{ background: '#11161d', borderBottom: '1px solid #1e2833', padding: '8px 14px', fontSize: 10, letterSpacing: 2, color: '#6b7c8c' }}>
        ▮ TERMINAL DE EVENTOS
      </div>
      <div style={{ padding: '10px 14px', maxHeight: 380, overflowY: 'auto', display: 'grid', gap: 7, fontSize: 11.5 }}>
        {log.map((l) => (
          <div key={l.id} style={{ display: 'flex', gap: 8, animation: 'surgir .3s ease' }}>
            <span style={{ color: '#3a4a5a', flex: 'none' }}>{l.mes}</span>
            <span style={{ color: l.cor }}>{l.texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
