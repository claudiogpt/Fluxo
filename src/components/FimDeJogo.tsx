// Overlay de fim de jogo — portado do FimDeJogo do protótipo DC, agora com o
// DIAGNÓSTICO da partida (etapa F).
//
// Aqui é onde o jogador realmente quer saber o que aconteceu, então quando há
// um diagnóstico confiável ele toma o lugar da lição genérica: duas linhas,
// nome do que aconteceu e um convite de leitura com tecla. Sem diagnóstico,
// fica só a lição de sempre — inventar causa seria pior que não dizer nada.
import { useDispatch, useSelector } from 'react-redux';
import { abrirEstudo, selectDiagnostico } from '../features/biblioteca';
import { selectFimInfo, selectPainel } from '../features/game/selectors';
import { reiniciar, voltarMenu } from '../features/game/gameSlice';
import { abrirBiblioteca } from '../features/ui/uiSlice';
import type { AppDispatch } from '../store';

export function FimDeJogo() {
  const fim = useSelector(selectFimInfo);
  const painel = useSelector(selectPainel);
  const diag = useSelector(selectDiagnostico);
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
        {/* O corpo do título encolhe com o comprimento: 'FALIU' pede 72px,
            'FIM DO TUTORIAL' na mesma medida quebraria em duas linhas dentro
            dos 560px da coluna. A conta é a largura do caractere monoespaçado
            (~0,62em) contra a largura disponível. */}
        <div style={{ fontSize: Math.min(72, Math.floor(520 / (fim.titulo.length * 0.62))), fontWeight: 700, letterSpacing: -2, color: fim.cor, animation: 'piscar 1.2s step-end infinite' }}>
          {fim.titulo}
        </div>
        <p style={{ color: 'var(--texto)', fontSize: 14, margin: '18px 0 6px' }}>{fim.resumo}</p>
        {diag ? (
          <div style={{ margin: '0 0 28px', fontSize: 12.5, lineHeight: 1.8 }}>
            <div style={{ color: 'var(--texto)' }}>
              {fim.titulo} no mês {diag.mes} — {diag.causa}
            </div>
            {diag.estudo && (
              <div style={{ color: 'var(--texto-fraco)' }}>
                isso tem nome: {diag.estudo.conceito} ·{' '}
                <button
                  type="button"
                  onClick={() => {
                    dispatch(abrirEstudo(diag.estudo!.id));
                    dispatch(abrirBiblioteca());
                  }}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--sucesso)', cursor: 'pointer' }}
                >
                  [L] ler ({diag.estudo.tempoLeituraMin} min)
                </button>
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--texto-fraco)', fontSize: 12, margin: '0 0 28px' }}>{fim.licao}</p>
        )}
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
