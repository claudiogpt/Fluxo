// Painel de status — portado 1:1 de PainelStatus.dc.html.
import { useDispatch, useSelector } from 'react-redux';
import { selectPainel } from '../features/game/selectors';
import { voltarMenu } from '../features/game/gameSlice';
import type { AppDispatch } from '../store';

const card = {
  background: '#11161d',
  border: '1px solid #1e2833',
  borderRadius: 6,
  padding: '12px 14px',
} as const;

const rotulo = { color: '#6b7c8c', fontSize: 10, letterSpacing: 1 } as const;

export function PainelStatus() {
  const p = useSelector(selectPainel);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div style={{ color: '#d7e1ea', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, lineHeight: 1.5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, borderBottom: '1px solid #1e2833', paddingBottom: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, letterSpacing: 1, color: '#f2f7fb' }}>
          FALÊNCIA <span style={{ color: '#3a4a5a' }}>ou</span> <span style={{ color: '#22d47e' }}>LIBERDADE</span>
        </div>
        {p.modoTag && (
          <span style={{ fontSize: 9, letterSpacing: 2, color: '#ffc24b', border: '1px solid #ffc24b', borderRadius: 3, padding: '2px 8px' }}>
            {p.modoTag}
          </span>
        )}
        <div style={{ color: '#8fa1b2' }}>
          MÊS <span style={{ color: '#f2f7fb', fontWeight: 600 }}>{p.mesFmt}</span>
        </div>
        <div style={{ color: '#8fa1b2' }}>
          ⏱ <span style={{ color: p.tempoCor, fontWeight: 600 }}>{p.tempoFmt}</span>
        </div>
        <svg width={180} height={34} viewBox="0 0 180 34" style={{ display: 'block' }}>
          <polyline points={p.sparkPoints} fill="none" stroke={p.sparkCor} strokeWidth={1.5} />
        </svg>
        <button
          onClick={() => dispatch(voltarMenu())}
          style={{ background: 'transparent', border: '1px solid #1e2833', color: '#6b7c8c', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: 1, padding: '5px 10px', borderRadius: 3, cursor: 'pointer' }}
        >
          ◂ MENU
        </button>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={rotulo}>PATRIMÔNIO TOTAL</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f2f7fb' }}>{p.patrimonioFmt}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
        <div style={card}>
          <div style={rotulo}>SALDO EM CAIXA</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: p.caixaCor }}>{p.caixaFmt}</div>
        </div>
        <div style={card}>
          <div style={rotulo}>{p.salarioLabel}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: p.salarioCor }}>{p.salarioStatus}</div>
        </div>
        <div style={card}>
          <div style={rotulo}>CUSTO DE VIDA / MÊS</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#ff4d5e' }}>−{p.custoFmt}</div>
        </div>
        <div style={card}>
          <div style={rotulo}>RENDA PASSIVA / MÊS</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#22d47e' }}>+{p.rpFmt}</div>
        </div>
      </div>

      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: 1, color: '#6b7c8c', marginBottom: 8 }}>
          <span>{p.progLabel}</span>
          <span style={{ color: p.progCor, fontWeight: 600 }}>{p.progFmt}</span>
        </div>
        <div style={{ height: 8, background: '#0b0f14', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: p.progPct + '%', background: p.progCor, transition: 'width .5s ease' }} />
        </div>
      </div>
    </div>
  );
}
