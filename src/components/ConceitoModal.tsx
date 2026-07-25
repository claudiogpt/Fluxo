// Modal educacional de primeira vez — portado 1:1 de ConceitoModal.dc.html.
// Dados do conceitosSlice; confirmar/cancelar são os thunks (ação pendente).
import { useDispatch, useSelector } from 'react-redux';
import { selectModalConceito } from '../features/conceitos/conceitosSlice';
import { cancelarModal, confirmarModal } from '../features/conceitos/thunks';
import type { AppDispatch } from '../store';

const mono = "'IBM Plex Mono',monospace";

export function ConceitoModal() {
  const m = useSelector(selectModalConceito);
  const dispatch = useDispatch<AppDispatch>();
  if (!m) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,11,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, animation: 'surgir .25s ease', color: '#d7e1ea', fontFamily: mono, lineHeight: 1.5 }}>
      <div style={{ maxWidth: 520, width: 'calc(100% - 48px)', background: '#0d1117', border: '1px solid #22d47e', borderRadius: 8, padding: '24px 26px' }}>
        <div style={{ color: '#22d47e', fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>◆ CONCEITO NOVO DESBLOQUEADO</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5, color: '#f2f7fb', marginBottom: 10 }}>{m.titulo}</div>
        <p style={{ color: '#d7e1ea', fontSize: 13, margin: '0 0 14px' }}>{m.explicacao}</p>
        {m.termosFmt && (
          <div style={{ color: '#6b7c8c', fontSize: 10.5, letterSpacing: 0.5, marginBottom: 18 }}>
            📖 vai pro seu glossário: <span style={{ color: '#8fd47e' }}>{m.termosFmt}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => dispatch(confirmarModal())}
            style={{ background: '#22d47e', color: '#08110c', border: 'none', fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '11px 22px', borderRadius: 4, cursor: 'pointer' }}
          >
            {m.confirmarLabel}
          </button>
          {m.mostraCancelar && (
            <button
              onClick={() => dispatch(cancelarModal())}
              style={{ background: 'transparent', border: '1px solid #3a4a5a', color: '#8fa1b2', fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '11px 22px', borderRadius: 4, cursor: 'pointer' }}
            >
              CANCELAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
