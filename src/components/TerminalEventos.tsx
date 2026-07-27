// Terminal de eventos (log) — portado 1:1 do TerminalEventos do protótipo DC (git history).
import { useSelector } from 'react-redux';
import { selectLogLinhas } from '../features/game/selectors';

export function TerminalEventos() {
  const log = useSelector(selectLogLinhas);
  return (
    <div style={{ background: 'var(--superficie)', border: '1px solid var(--borda)', borderRadius: 6, overflow: 'hidden', color: 'var(--texto)', lineHeight: 1.5 }}>
      <div style={{ background: 'var(--superficie-2)', borderBottom: '1px solid var(--borda)', padding: '8px 14px', fontSize: 10, letterSpacing: 2, color: 'var(--texto-rotulo)' }}>
        ▮ TERMINAL DE EVENTOS
      </div>
      <div style={{ padding: '10px 14px', maxHeight: 380, overflowY: 'auto', display: 'grid', gap: 7, fontSize: 11.5 }}>
        {log.map((l) => (
          <div key={l.id} style={{ display: 'flex', gap: 8, animation: 'surgir .3s ease' }}>
            <span style={{ color: 'var(--texto-apagado)', flex: 'none' }}>{l.mes}</span>
            <span style={{ color: l.cor }}>{l.texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
