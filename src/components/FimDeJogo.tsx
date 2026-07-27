// Overlay de fim de jogo — portado 1:1 do FimDeJogo do protótipo DC (git history) (5 desfechos).
import { useDispatch, useSelector } from 'react-redux';
import { selectFimInfo, selectPainel } from '../features/game/selectors';
import { reiniciar, voltarMenu } from '../features/game/gameSlice';
import type { AppDispatch } from '../store';

export function FimDeJogo() {
  const fim = useSelector(selectFimInfo);
  const painel = useSelector(selectPainel);
  const dispatch = useDispatch<AppDispatch>();
  if (!fim) return null;

  const btn = {
    background: 'transparent', fontWeight: 700, fontSize: 14,
    letterSpacing: 1, padding: '12px 28px', borderRadius: 4, cursor: 'pointer',
  } as const;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay-forte)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, animation: 'surgir .4s ease', color: 'var(--texto)', lineHeight: 1.5 }}>
      <div style={{ textAlign: 'center', maxWidth: 560, padding: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--texto-rotulo)', marginBottom: 10 }}>
          SIMULAÇÃO ENCERRADA — MÊS {painel.mesFmt} — ⏱ {painel.tempoFmt}
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2, color: fim.cor, animation: 'piscar 1.2s step-end infinite' }}>
          {fim.titulo}
        </div>
        <p style={{ color: 'var(--texto)', fontSize: 14, margin: '18px 0 6px' }}>{fim.resumo}</p>
        <p style={{ color: 'var(--texto-fraco)', fontSize: 12, margin: '0 0 28px' }}>{fim.licao}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => dispatch(reiniciar())} style={{ ...btn, border: `1px solid ${fim.cor}`, color: fim.cor }}>
            ▸ JOGAR DE NOVO
          </button>
          <button onClick={() => dispatch(voltarMenu())} style={{ ...btn, border: '1px solid var(--texto-apagado)', color: 'var(--texto-fraco)' }}>
            ◂ MENU
          </button>
        </div>
      </div>
    </div>
  );
}
