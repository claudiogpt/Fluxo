// Card de ativo com aporte/resgate — portado 1:1 de AtivoCard.dc.html.
// O aporte passa pelo thunk educacional (1ª vez em reserva/ações/cripto = modal).
import { useDispatch, useSelector } from 'react-redux';
import type { AtivoKey } from '../engine/types';
import { moverComConceito } from '../features/conceitos/thunks';
import { selectGame, type selectAtivosLista } from '../features/game/selectors';
import type { AppDispatch } from '../store';

type Linha = ReturnType<typeof selectAtivosLista>[number];

const mono = "'IBM Plex Mono',monospace";
const btnMais = {
  background: '#0e1a14', border: '1px solid #1e4a34', color: '#22d47e',
  fontFamily: mono, fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 3, cursor: 'pointer',
} as const;
const btnMenos = { ...btnMais, background: '#1a1114', border: '1px solid #4a1e28', color: '#ff4d5e' } as const;

export function AtivoCard({ a }: { a: Linha }) {
  const dispatch = useDispatch<AppDispatch>();
  const { caixa, ativos } = useSelector(selectGame);
  const mover = (valor: number) => dispatch(moverComConceito(a.key as AtivoKey, valor));

  return (
    <div style={{ background: '#11161d', border: '1px solid #1e2833', borderRadius: 6, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', alignItems: 'center', color: '#d7e1ea', fontFamily: mono, fontSize: 13, lineHeight: 1.5 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#f2f7fb', letterSpacing: 0.5 }}>{a.nome}</span>
          <span style={{ color: '#3a4a5a', fontSize: 11 }}>{a.ticker}</span>
          <span style={{ fontSize: 10, letterSpacing: 1, color: a.riscoCor, border: `1px solid ${a.riscoCor}`, borderRadius: 3, padding: '1px 6px' }}>{a.riscoLabel}</span>
        </div>
        <div style={{ color: '#6b7c8c', fontSize: 11, marginTop: 2, maxWidth: 460 }}>{a.dica}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#f2f7fb' }}>{a.valorFmt}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: a.varCor }}>{a.varFmt}</div>
      </div>
      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #1a222c', paddingTop: 9 }}>
        <span style={{ color: '#3a4a5a', fontSize: 10, letterSpacing: 1 }}>APORTE</span>
        <button style={btnMais} onClick={() => mover(500)}>+500</button>
        <button style={btnMais} onClick={() => mover(1000)}>+1.000</button>
        <button style={btnMais} onClick={() => mover(2000)}>+2.000</button>
        <button style={btnMais} onClick={() => mover(caixa)}>MAX</button>
        <span style={{ color: '#3a4a5a', fontSize: 10, letterSpacing: 1, marginLeft: 10 }}>RESGATE</span>
        <button style={btnMenos} onClick={() => mover(-500)}>−500</button>
        <button style={btnMenos} onClick={() => mover(-1000)}>−1.000</button>
        <button style={btnMenos} onClick={() => mover(-2000)}>−2.000</button>
        <button style={btnMenos} onClick={() => mover(-ativos[a.key as AtivoKey])}>ZERAR</button>
      </div>
    </div>
  );
}
