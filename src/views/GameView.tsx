// Tela de jogo. O layout é intrínseco (o grid colapsa sozinho pelo tema.css);
// as abas só existem em tela estreita — no desktop o CSS as esconde e mostra
// os dois painéis juntos, então o estado abaixo fica inerte lá.
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AtivoCard } from '../components/AtivoCard';
import { LinhaHint } from '../components/biblioteca/LinhaHint';
import { CarteiraCategorias } from '../components/CarteiraCategorias';
import { CustosCard } from '../components/CustosCard';
import { ImovelCard } from '../components/ImovelCard';
import { Leaderboard } from '../components/Leaderboard';
import { MacroCard } from '../components/MacroCard';
import { NegocioCard } from '../components/NegocioCard';
import { PainelStatus } from '../components/PainelStatus';
import { TerminalEventos } from '../components/TerminalEventos';
import { fecharMes, reiniciar, toggleAuto } from '../features/game/gameSlice';
import { selectAtivosLista, selectPainel } from '../features/game/selectors';
import type { AppDispatch } from '../store';

type Aba = 'ativos' | 'eventos' | 'placar';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'ativos', rotulo: 'ATIVOS' },
  { id: 'eventos', rotulo: 'EVENTOS' },
  { id: 'placar', rotulo: 'PLACAR' },
];

export function GameView() {
  const ativos = useSelector(selectAtivosLista);
  const p = useSelector(selectPainel);
  const dispatch = useDispatch<AppDispatch>();
  const [aba, setAba] = useState<Aba>('ativos');
  // Categoria aberta no drill-down do realista. Mora aqui pelo mesmo motivo da
  // aba: é navegação de UI, não regra de negócio — o gameSlice é o espelho do
  // engine e o uiSlice é a pilha do MENU.
  const [categoria, setCategoria] = useState<string | null>(null);

  const marca = (id: Aba) => (aba === id ? 'sim' : 'nao');

  return (
    <div className="jogo-tela">
      <PainelStatus />

      <div className="jogo-abas" role="tablist" aria-label="Seções do jogo">
        {ABAS.map((t) => {
          const sel = aba === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={sel}
              onClick={() => setAba(t.id)}
              style={{
                background: sel ? 'var(--tint-sucesso)' : 'transparent',
                border: `1px solid ${sel ? 'var(--sucesso)' : 'var(--borda)'}`,
                color: sel ? 'var(--sucesso)' : 'var(--texto-rotulo)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                padding: '9px 0',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {t.rotulo}
            </button>
          );
        })}
      </div>

      <div className="jogo-grade">
        <div className="jogo-painel jogo-conteudo" data-ativa={marca('ativos')} style={{ gap: 10 }}>
          <NegocioCard />
          <ImovelCard />
          <MacroCard />
          {/* No realista `ativos` vem vazia: a carteira é navegada por
              categoria. Nos outros modos a CarteiraCategorias é que não
              renderiza nada — cada um se apaga sozinho, sem `if (modo ===)`. */}
          <CarteiraCategorias aberta={categoria} aoAbrir={setCategoria} aoVoltar={() => setCategoria(null)} />
          <CustosCard />
          {ativos.map((a) => (
            <AtivoCard key={a.key} a={a} />
          ))}
        </div>

        <div className="jogo-lateral">
          <div className="jogo-painel" data-ativa={marca('eventos')}>
            <TerminalEventos />
          </div>
          <div className="jogo-painel" data-ativa={marca('placar')}>
            <Leaderboard />
          </div>
        </div>

        {/* Fora dos painéis de aba de propósito: fechar o mês é a ação central
            e não pode sumir quando o jogador está olhando eventos ou placar. */}
        <div className="jogo-rodape">
          <div className="jogo-acoes" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => dispatch(fecharMes())}
              style={{ background: 'var(--sucesso-solido)', color: 'var(--sobre-sucesso)', border: 'none', fontWeight: 700, fontSize: 16, letterSpacing: 2, padding: 16, borderRadius: 5, cursor: 'pointer' }}
            >
              FECHAR O MÊS ▸
            </button>
            {p.ehSandbox && (
              <button
                onClick={() => dispatch(reiniciar())}
                style={{ background: 'transparent', color: 'var(--texto-rotulo)', border: '1px solid var(--texto-apagado)', fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '16px 0', borderRadius: 5, cursor: 'pointer' }}
              >
                ↺ RESETAR
              </button>
            )}
            <button
              onClick={() => dispatch(toggleAuto())}
              style={{ background: p.autoBg, color: p.autoCor, border: `1px solid ${p.autoCor}`, fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: '16px 0', borderRadius: 5, cursor: 'pointer' }}
            >
              {p.autoLabel}
            </button>
          </div>
          {/* dica de teclado: escondida no estreito, onde não há teclado */}
          <div className="jogo-atalhos" style={{ color: 'var(--texto-apagado)', fontSize: 10.5, textAlign: 'center' }}>
            [ESPAÇO] fecha o mês · [A] liga/desliga o auto — roda direto até o fim da simulação
          </div>
          {/* O hint fica FORA da dica de atalhos porque no estreito aquela some
              e este não pode sumir: é o único aviso daquela mecânica. */}
          <LinhaHint />
        </div>

      </div>
    </div>
  );
}
