// Card do negócio (modo empresário) — portado 1:1 de NegocioCard.dc.html.
import { useDispatch, useSelector } from 'react-redux';
import { aportarNegocio, reinvestirNegocio, sacarNegocio } from '../features/game/gameSlice';
import { selectNegocioCard } from '../features/game/selectors';
import type { AppDispatch } from '../store';

const mono = "'IBM Plex Mono',monospace";
const btnAmbar = {
  background: '#1a1509', border: '1px solid #6b5518', color: '#ffc24b',
  fontFamily: mono, fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 3, cursor: 'pointer',
} as const;
const btnVerde = { ...btnAmbar, background: '#0e1a14', border: '1px solid #1e4a34', color: '#22d47e', padding: '5px 10px' } as const;
const btnVermelho = { ...btnAmbar, background: '#1a1114', border: '1px solid #4a1e28', color: '#ff4d5e', padding: '5px 10px' } as const;

export function NegocioCard() {
  const n = useSelector(selectNegocioCard);
  const dispatch = useDispatch<AppDispatch>();
  if (!n) return null;

  return (
    <div style={{ background: '#161309', border: '1px solid #4a3d1e', borderRadius: 6, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', alignItems: 'center', color: '#d7e1ea', fontFamily: mono, fontSize: 13, lineHeight: 1.5 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#ffc24b', letterSpacing: 0.5 }}>SEU NEGÓCIO</span>
          <span style={{ color: '#3a4a5a', fontSize: 11 }}>CNPJ · LTDA</span>
          <span style={{ fontSize: 10, letterSpacing: 1, color: n.statusCor, border: `1px solid ${n.statusCor}`, borderRadius: 3, padding: '1px 6px' }}>{n.statusLabel}</span>
        </div>
        <div style={{ color: '#6b7c8c', fontSize: 11, marginTop: 2, maxWidth: 460 }}>{n.dica}</div>
        <div style={{ color: '#8fa1b2', fontSize: 11, marginTop: 6 }}>
          receita base <span style={{ color: '#f2f7fb', fontWeight: 600 }}>{n.receitaBaseFmt}</span>/mês · custos fixos{' '}
          <span style={{ color: '#ff9d4b', fontWeight: 600 }}>−{n.custoFixoFmt}</span>/mês
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: '#6b7c8c', fontSize: 10, letterSpacing: 1 }}>CAIXA DA EMPRESA</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: n.caixaCor }}>{n.caixaFmt}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: n.receitaCor }}>{n.receitaFmt}</div>
      </div>
      {n.operando && (
        <div style={{ gridColumn: '1/-1', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #2a2312', paddingTop: 9 }}>
          <button style={btnAmbar} onClick={() => dispatch(reinvestirNegocio())}>{n.reinvestirLabel}</button>
          <span style={{ color: '#3a4a5a', fontSize: 10, letterSpacing: 1, marginLeft: 10 }}>SACAR → SEU BOLSO</span>
          <button style={btnVerde} onClick={() => dispatch(sacarNegocio(500))}>−500</button>
          <button style={btnVerde} onClick={() => dispatch(sacarNegocio(1000))}>−1.000</button>
          <button style={btnVerde} onClick={() => dispatch(sacarNegocio(2000))}>−2.000</button>
          <button style={btnVerde} onClick={() => dispatch(sacarNegocio(n.caixaNegocio))}>MAX</button>
          <span style={{ color: '#3a4a5a', fontSize: 10, letterSpacing: 1, marginLeft: 10 }}>APORTAR GIRO</span>
          <button style={btnVermelho} onClick={() => dispatch(aportarNegocio(500))}>+500</button>
          <button style={btnVermelho} onClick={() => dispatch(aportarNegocio(1000))}>+1.000</button>
          <button style={btnVermelho} onClick={() => dispatch(aportarNegocio(2000))}>+2.000</button>
        </div>
      )}
      {n.falido && (
        <div style={{ gridColumn: '1/-1', borderTop: '1px solid #2a2312', paddingTop: 9, color: '#ff4d5e', fontSize: 11 }}>
          ■ Empresa encerrada. Agora só seus investimentos sustentam seu custo de vida — é exatamente pra isso que se diversifica.
        </div>
      )}
    </div>
  );
}
