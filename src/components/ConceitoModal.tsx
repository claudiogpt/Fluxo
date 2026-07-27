// Modal educacional de primeira vez — portado 1:1 do ConceitoModal do protótipo DC (git history).
// Dados do conceitosSlice; confirmar/cancelar são os thunks (ação pendente).
import { useDispatch, useSelector } from 'react-redux';
import { selectModalConceito } from '../features/conceitos/conceitosSlice';
import { cancelarModal, confirmarModal } from '../features/conceitos/thunks';
import type { AppDispatch } from '../store';

export function ConceitoModal() {
  const m = useSelector(selectModalConceito);
  const dispatch = useDispatch<AppDispatch>();
  if (!m) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, animation: 'surgir .25s ease', color: 'var(--texto)', lineHeight: 1.5 }}>
      <div style={{ maxWidth: 520, width: 'calc(100% - 48px)', background: 'var(--superficie)', border: '1px solid var(--sucesso)', borderRadius: 8, padding: '24px 26px' }}>
        <div style={{ color: 'var(--sucesso)', fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>◆ CONCEITO NOVO DESBLOQUEADO</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5, color: 'var(--texto-forte)', marginBottom: 10 }}>{m.titulo}</div>
        <p style={{ color: 'var(--texto)', fontSize: 13, margin: '0 0 14px' }}>{m.explicacao}</p>
        {m.termosFmt && (
          <div style={{ color: 'var(--texto-rotulo)', fontSize: 10.5, letterSpacing: 0.5, marginBottom: 18 }}>
            📖 vai pro seu glossário: <span style={{ color: 'var(--sucesso-suave)' }}>{m.termosFmt}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => dispatch(confirmarModal())}
            style={{ background: 'var(--sucesso-solido)', color: 'var(--sobre-sucesso)', border: 'none', fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '11px 22px', borderRadius: 4, cursor: 'pointer' }}
          >
            {m.confirmarLabel}
          </button>
          {m.mostraCancelar && (
            <button
              onClick={() => dispatch(cancelarModal())}
              style={{ background: 'transparent', border: '1px solid var(--texto-apagado)', color: 'var(--texto-fraco)', fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '11px 22px', borderRadius: 4, cursor: 'pointer' }}
            >
              CANCELAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
