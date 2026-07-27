// Tela de jogo — porta a composição do orquestrador DC (grid 1fr/340px).
import { useDispatch, useSelector } from 'react-redux';
import { AtivoCard } from '../components/AtivoCard';
import { ImovelCard } from '../components/ImovelCard';
import { Leaderboard } from '../components/Leaderboard';
import { NegocioCard } from '../components/NegocioCard';
import { PainelStatus } from '../components/PainelStatus';
import { TerminalEventos } from '../components/TerminalEventos';
import { fecharMes, reiniciar, toggleAuto } from '../features/game/gameSlice';
import { selectAtivosLista, selectPainel } from '../features/game/selectors';
import type { AppDispatch } from '../store';

export function GameView() {
  const ativos = useSelector(selectAtivosLista);
  const p = useSelector(selectPainel);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px 32px' }}>
      <PainelStatus />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <NegocioCard />
          <ImovelCard />
          {ativos.map((a) => (
            <AtivoCard key={a.key} a={a} />
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={() => dispatch(fecharMes())}
              style={{ flex: 1, background: 'var(--sucesso-solido)', color: 'var(--sobre-sucesso)', border: 'none', fontWeight: 700, fontSize: 16, letterSpacing: 2, padding: 16, borderRadius: 5, cursor: 'pointer' }}
            >
              FECHAR O MÊS ▸
            </button>
            {p.ehSandbox && (
              <button
                onClick={() => dispatch(reiniciar())}
                style={{ width: 150, background: 'transparent', color: 'var(--texto-rotulo)', border: '1px solid var(--texto-apagado)', fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '16px 0', borderRadius: 5, cursor: 'pointer' }}
              >
                ↺ RESETAR
              </button>
            )}
            <button
              onClick={() => dispatch(toggleAuto())}
              style={{ width: 150, background: p.autoBg, color: p.autoCor, border: `1px solid ${p.autoCor}`, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '16px 0', borderRadius: 5, cursor: 'pointer' }}
            >
              {p.autoLabel}
            </button>
          </div>
          <div style={{ color: 'var(--texto-apagado)', fontSize: 10.5, textAlign: 'center' }}>
            [ESPAÇO] fecha o mês · [A] liga/desliga o auto — roda direto até o fim da simulação
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <TerminalEventos />
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
