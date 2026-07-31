// Painel de status — portado 1:1 do PainelStatus do protótipo DC (git history).
import { useDispatch, useSelector } from 'react-redux';
import { selectPainel } from '../features/game/selectors';
import { voltarMenu } from '../features/game/gameSlice';
import { selectContadorGlossario } from '../features/biblioteca';
import { alternarBiblioteca } from '../features/ui/uiSlice';
import type { AppDispatch } from '../store';

const card = {
  background: 'var(--superficie-2)',
  border: '1px solid var(--borda)',
  borderRadius: 6,
  padding: '12px 14px',
} as const;

const rotulo = { color: 'var(--texto-rotulo)', fontSize: 10, letterSpacing: 1 } as const;

const botaoTopo = {
  background: 'transparent',
  border: '1px solid var(--borda)',
  color: 'var(--texto-rotulo)',
  fontSize: 10,
  letterSpacing: 1,
  padding: '5px 10px',
  borderRadius: 3,
  cursor: 'pointer',
} as const;

export function PainelStatus() {
  const p = useSelector(selectPainel);
  const termos = useSelector(selectContadorGlossario);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div style={{ color: 'var(--texto)', fontSize: 13, lineHeight: 1.5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px 16px', borderBottom: '1px solid var(--borda)', paddingBottom: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, color: 'var(--texto-forte)' }}>
          <span style={{ fontFamily: 'var(--fonte-titulo)', letterSpacing: 2 }}>PECULIUM</span>
          <span style={{ color: 'var(--texto-apagado)' }}> · </span>
          <span style={{ color: 'var(--sucesso)', letterSpacing: 1 }}>FLUXO</span>
        </div>
        {p.modoTag && (
          <span style={{ fontSize: 9, letterSpacing: 2, color: 'var(--aviso)', border: '1px solid var(--aviso)', borderRadius: 3, padding: '2px 8px' }}>
            {p.modoTag}
          </span>
        )}
        <div style={{ color: 'var(--texto-fraco)' }}>
          MÊS <span style={{ color: 'var(--texto-forte)', fontWeight: 600 }}>{p.mesFmt}</span>
        </div>
        <div style={{ color: 'var(--texto-fraco)' }}>
          ⏱ <span style={{ color: p.tempoCor, fontWeight: 600 }}>{p.tempoFmt}</span>
        </div>
        <svg width={180} height={34} viewBox="0 0 180 34" style={{ display: 'block', flex: 'none', maxWidth: '100%' }} aria-hidden="true">
          <polyline points={p.sparkPoints} fill="none" stroke={p.sparkCor} strokeWidth={1.5} />
        </svg>
        {/* No largo `.acoes-topo` é `display: contents` — o wrapper some do
            layout e o MENU segue solto na linha, como antes. No estreito ele
            vira uma faixa própria, centralizada, com a biblioteca ao lado (e aí
            o botão flutuante some, em vez de pairar sobre o jogo). */}
        <div className="acoes-topo">
          <button onClick={() => dispatch(voltarMenu())} style={botaoTopo}>
            ◂ MENU
          </button>
          <button
            className="biblioteca-topo"
            onClick={() => dispatch(alternarBiblioteca())}
            style={{ ...botaoTopo, alignItems: 'center', gap: 6 }}
            aria-label="Abrir biblioteca"
          >
            📚 {termos}
          </button>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={rotulo}>PATRIMÔNIO TOTAL</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--texto-forte)' }}>{p.patrimonioFmt}</div>
        </div>
      </div>

      {/* auto-fit resolve os três tamanhos sem breakpoint: 4-up no desktop,
          2-up no tablet, 1-up no celular. Antes era repeat(4,1fr) fixo, que
          no estreito virava 4 colunas de 84px com o rótulo em 3 linhas. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 10 }}>
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
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--perigo)' }}>−{p.custoFmt}</div>
        </div>
        <div style={card}>
          <div style={rotulo}>RENDA PASSIVA / MÊS</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--sucesso)' }}>+{p.rpFmt}</div>
        </div>
      </div>

      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: 1, color: 'var(--texto-rotulo)', marginBottom: 8 }}>
          <span>{p.progLabel}</span>
          <span style={{ color: p.progCor, fontWeight: 600 }}>{p.progFmt}</span>
        </div>
        <div style={{ height: 8, background: 'var(--fundo)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: p.progPct + '%', background: p.progCor, transition: 'width .5s ease' }} />
        </div>
      </div>
    </div>
  );
}
