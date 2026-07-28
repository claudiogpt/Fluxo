// Substitui os 8 botões fixos (+500/+1.000/+2.000/MAX e os negativos) por um
// trilho percentual. A razão é escala: a fileira de botões crescia junto com o
// número de ativos, e o percentual não cresce.
//
// O trilho vai de 0 a 100% em passos de 5. O que 100% significa depende do
// alternador: no APORTE é todo o saldo em caixa (mesma base do MAX de antes);
// no RESGATE é o total já investido NESTE ativo.
//
// MAX e ZERAR são as tampas das pontas: atalhos de um toque para os extremos,
// independentes do modo — MAX joga o caixa inteiro pra dentro, ZERAR tira tudo.
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formato } from '../engine';
import type { AtivoKey } from '../engine/types';
import { aportarPctComConceito } from '../features/conceitos/thunks';
import { resgatarPct, valorDePct } from '../features/game/gameSlice';
import { selectGame } from '../features/game/selectors';
import type { AppDispatch } from '../store';

type Modo = 'aportar' | 'resgatar';

const PASSO = 5;

const btnTampa = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  padding: '6px 10px',
  borderRadius: 3,
  cursor: 'pointer',
  flex: 'none',
} as const;

export function ControleAporte({ ativo }: { ativo: AtivoKey }) {
  const { caixa, ativos } = useSelector(selectGame);
  const dispatch = useDispatch<AppDispatch>();
  const [modo, setModo] = useState<Modo>('aportar');
  const [pct, setPct] = useState(0);

  const base = modo === 'aportar' ? caixa : ativos[ativo];
  const previa = valorDePct(base, pct);
  const acento = modo === 'aportar' ? 'var(--sucesso)' : 'var(--perigo)';

  // Commit no SOLTAR, não a cada passo: o onChange do range dispara dezenas de
  // vezes por arraste, e cada um mexeria no jogo de verdade.
  const confirmar = () => {
    if (pct <= 0) return;
    if (modo === 'aportar') dispatch(aportarPctComConceito(ativo, pct));
    else dispatch(resgatarPct({ key: ativo, pct }));
    setPct(0); // a base mudou: o trilho volta ao zero
  };

  const alternador = (m: Modo, rotulo: string) => {
    const sel = modo === m;
    const cor = m === 'aportar' ? 'var(--sucesso)' : 'var(--perigo)';
    return (
      <button
        type="button"
        aria-pressed={sel}
        onClick={() => {
          setModo(m);
          setPct(0);
        }}
        style={{
          background: sel ? `color-mix(in srgb, ${cor} 12%, transparent)` : 'transparent',
          border: `1px solid ${sel ? cor : 'var(--borda)'}`,
          color: sel ? cor : 'var(--texto-rotulo)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          padding: '5px 12px',
          borderRadius: 3,
          cursor: 'pointer',
        }}
      >
        {rotulo}
      </button>
    );
  };

  return (
    <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--borda-suave)', paddingTop: 10, display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {alternador('aportar', 'APORTAR')}
        {alternador('resgatar', 'RESGATAR')}
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: pct > 0 ? acento : 'var(--texto-apagado)' }}>
          {pct}% · {formato.fmt(previa)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={() => dispatch(resgatarPct({ key: ativo, pct: 100 }))}
          title="Resgatar tudo deste ativo"
          style={{ ...btnTampa, background: 'var(--perigo-fundo)', border: '1px solid var(--perigo-borda)', color: 'var(--perigo)' }}
        >
          ZERAR
        </button>

        <input
          type="range"
          min={0}
          max={100}
          step={PASSO}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          onPointerUp={confirmar}
          onKeyUp={confirmar}
          onBlur={() => setPct(0)}
          aria-label={modo === 'aportar' ? 'Percentual do caixa a aportar' : 'Percentual do ativo a resgatar'}
          aria-valuetext={`${pct} por cento, ${formato.fmt(previa)}`}
          style={{ flex: 1, minWidth: 0, accentColor: acento, cursor: 'pointer' }}
        />

        <button
          type="button"
          onClick={() => dispatch(aportarPctComConceito(ativo, 100))}
          title="Aportar todo o saldo em caixa"
          style={{ ...btnTampa, background: 'var(--sucesso-fundo)', border: '1px solid var(--sucesso-borda)', color: 'var(--sucesso)' }}
        >
          MAX
        </button>
      </div>

      <div style={{ color: 'var(--texto-apagado)', fontSize: 10 }}>
        {modo === 'aportar'
          ? `100% = todo o caixa (${formato.fmt(caixa)})`
          : `100% = tudo que está neste ativo (${formato.fmt(ativos[ativo])})`}
      </div>
    </div>
  );
}
