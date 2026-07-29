// Substitui os 8 botões fixos (+500/+1.000/+2.000/MAX e os negativos) por um
// trilho percentual. A razão é escala: a fileira de botões crescia junto com o
// número de ativos, e o percentual não cresce.
//
// O trilho NÃO executa nada — ele só escolhe o percentual. Quem move o dinheiro
// são os botões APORTAR e RESGATAR, e cada um mostra o valor que vai mover,
// porque as bases são diferentes: aporte é % do caixa, resgate é % do que já
// está NESTE ativo. Escolher e confirmar são passos separados de propósito.
//
// MAX e ZERAR são as tampas das pontas do trilho: atalhos de um toque para os
// extremos (todo o caixa pra dentro, tudo do ativo pra fora).
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formato } from '../engine';
import type { AtivoKey } from '../engine/types';
import { aportarPctComConceito } from '../features/conceitos/thunks';
import { resgatarPct, valorDePct } from '../features/game/gameSlice';
import { selectGame } from '../features/game/selectors';
import type { AppDispatch } from '../store';

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

const btnConfirmar = {
  flex: '1 1 0',
  minWidth: 0,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.5,
  padding: '9px 6px',
  borderRadius: 4,
} as const;

/** `bloqueio` é opcional: os call sites dos modos clássicos não passam nada e
 *  continuam idênticos. Só o realista tem papel que não se pode vender. */
export function ControleAporte({
  ativo,
  bloqueio,
}: {
  ativo: AtivoKey;
  bloqueio?: { travado: boolean; motivo: string };
}) {
  const { caixa, ativos } = useSelector(selectGame);
  const dispatch = useDispatch<AppDispatch>();
  const [pct, setPct] = useState(0);

  // O mesmo percentual vale duas coisas diferentes — por isso cada botão
  // carrega o próprio valor, em vez de um readout único e ambíguo.
  const doAporte = valorDePct(caixa, pct);
  const travado = !!bloqueio?.travado;
  // Travado, o resgate vale zero: é o que desabilita os dois botões de venda
  // sem precisar de uma segunda condição espalhada pelo JSX.
  const doResgate = travado ? 0 : valorDePct(ativos[ativo], pct);

  return (
    <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--borda-suave)', paddingTop: 10, display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          disabled={travado}
          onClick={() => dispatch(resgatarPct({ key: ativo, pct: 100 }))}
          title={travado ? bloqueio!.motivo : 'Resgatar tudo deste ativo'}
          style={{
            ...btnTampa,
            background: travado ? 'transparent' : 'var(--perigo-fundo)',
            border: `1px solid ${travado ? 'var(--borda)' : 'var(--perigo-borda)'}`,
            color: travado ? 'var(--texto-apagado)' : 'var(--perigo)',
            cursor: travado ? 'default' : 'pointer',
          }}
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
          aria-label="Percentual a mover"
          aria-valuetext={`${pct} por cento`}
          style={{ flex: 1, minWidth: 0, accentColor: 'var(--texto-fraco)', cursor: 'pointer' }}
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: pct > 0 ? 'var(--texto-forte)' : 'var(--texto-apagado)', flex: 'none', minWidth: 44 }}>
          {pct}%
        </span>
        <button
          type="button"
          disabled={doAporte < 1}
          onClick={() => dispatch(aportarPctComConceito(ativo, pct))}
          style={{
            ...btnConfirmar,
            background: doAporte < 1 ? 'transparent' : 'var(--sucesso-fundo)',
            border: `1px solid ${doAporte < 1 ? 'var(--borda)' : 'var(--sucesso-borda)'}`,
            color: doAporte < 1 ? 'var(--texto-apagado)' : 'var(--sucesso)',
            cursor: doAporte < 1 ? 'default' : 'pointer',
          }}
        >
          APORTAR {formato.fmt(doAporte)}
        </button>
        <button
          type="button"
          disabled={doResgate < 1}
          onClick={() => dispatch(resgatarPct({ key: ativo, pct }))}
          style={{
            ...btnConfirmar,
            background: doResgate < 1 ? 'transparent' : 'var(--perigo-fundo)',
            border: `1px solid ${doResgate < 1 ? 'var(--borda)' : 'var(--perigo-borda)'}`,
            color: doResgate < 1 ? 'var(--texto-apagado)' : 'var(--perigo)',
            cursor: doResgate < 1 ? 'default' : 'pointer',
          }}
        >
          RESGATAR {formato.fmt(doResgate)}
        </button>
      </div>

      {/* o motivo fica visível: botão desabilitado sem explicação é bug pro
          jogador, não regra de jogo */}
      {travado && (
        <div style={{ fontSize: 10, letterSpacing: 0.5, color: 'var(--aviso)' }}>
          🔒 {bloqueio!.motivo}
        </div>
      )}
    </div>
  );
}
