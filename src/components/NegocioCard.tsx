// Card do negócio (modo empresário) — portado 1:1 do NegocioCard do protótipo DC (git history).
import { useDispatch, useSelector } from 'react-redux';
import { aportarNegocio, reinvestirNegocio, sacarNegocio } from '../features/game/gameSlice';
import { selectNegocioCard } from '../features/game/selectors';
import type { AppDispatch } from '../store';

const btnAmbar = {
  background: 'var(--aviso-fundo-2)', border: '1px solid var(--aviso-borda-2)', color: 'var(--aviso)',
  fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 3, cursor: 'pointer',
} as const;
const btnVerde = { ...btnAmbar, background: 'var(--sucesso-fundo)', border: '1px solid var(--sucesso-borda)', color: 'var(--sucesso)', padding: '5px 10px' } as const;
const btnVermelho = { ...btnAmbar, background: 'var(--perigo-fundo)', border: '1px solid var(--perigo-borda)', color: 'var(--perigo)', padding: '5px 10px' } as const;

export function NegocioCard() {
  const n = useSelector(selectNegocioCard);
  const dispatch = useDispatch<AppDispatch>();
  if (!n) return null;

  return (
    <div style={{ background: 'var(--aviso-fundo)', border: '1px solid var(--aviso-borda)', borderRadius: 6, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', alignItems: 'center', color: 'var(--texto)', fontSize: 13, lineHeight: 1.5 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--aviso)', letterSpacing: 0.5 }}>SEU NEGÓCIO</span>
          <span style={{ color: 'var(--texto-apagado)', fontSize: 11 }}>CNPJ · LTDA</span>
          <span style={{ fontSize: 10, letterSpacing: 1, color: n.statusCor, border: `1px solid ${n.statusCor}`, borderRadius: 3, padding: '1px 6px' }}>{n.statusLabel}</span>
        </div>
        <div style={{ color: 'var(--texto-rotulo)', fontSize: 11, marginTop: 2, maxWidth: 460 }}>{n.dica}</div>
        <div style={{ color: 'var(--texto-fraco)', fontSize: 11, marginTop: 6 }}>
          receita base <span style={{ color: 'var(--texto-forte)', fontWeight: 600 }}>{n.receitaBaseFmt}</span>/mês · custos fixos{' '}
          <span style={{ color: 'var(--alerta)', fontWeight: 600 }}>−{n.custoFixoFmt}</span>/mês
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: 'var(--texto-rotulo)', fontSize: 10, letterSpacing: 1 }}>CAIXA DA EMPRESA</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: n.caixaCor }}>{n.caixaFmt}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: n.receitaCor }}>{n.receitaFmt}</div>
      </div>
      {n.operando && (
        <div style={{ gridColumn: '1/-1', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--aviso-borda-suave)', paddingTop: 9 }}>
          <button style={btnAmbar} onClick={() => dispatch(reinvestirNegocio())}>{n.reinvestirLabel}</button>
          <span style={{ color: 'var(--texto-apagado)', fontSize: 10, letterSpacing: 1, marginLeft: 10 }}>SACAR → SEU BOLSO</span>
          <button style={btnVerde} onClick={() => dispatch(sacarNegocio(500))}>−500</button>
          <button style={btnVerde} onClick={() => dispatch(sacarNegocio(1000))}>−1.000</button>
          <button style={btnVerde} onClick={() => dispatch(sacarNegocio(2000))}>−2.000</button>
          <button style={btnVerde} onClick={() => dispatch(sacarNegocio(n.caixaNegocio))}>MAX</button>
          <span style={{ color: 'var(--texto-apagado)', fontSize: 10, letterSpacing: 1, marginLeft: 10 }}>APORTAR GIRO</span>
          <button style={btnVermelho} onClick={() => dispatch(aportarNegocio(500))}>+500</button>
          <button style={btnVermelho} onClick={() => dispatch(aportarNegocio(1000))}>+1.000</button>
          <button style={btnVermelho} onClick={() => dispatch(aportarNegocio(2000))}>+2.000</button>
        </div>
      )}
      {n.falido && (
        <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--aviso-borda-suave)', paddingTop: 9, color: 'var(--perigo)', fontSize: 11 }}>
          ■ Empresa encerrada. Agora só seus investimentos sustentam seu custo de vida — é exatamente pra isso que se diversifica.
        </div>
      )}
    </div>
  );
}
