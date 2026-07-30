// Camada 3 do tutorial: o hint just-in-time. Uma linha no rodapé, na primeira
// vez que uma mecânica aparece — e só nessa vez.
//
// O que ela NÃO faz, de propósito: não é modal, não pausa o jogo, não pede
// clique pra sumir (o próximo mês limpa) e não reaparece (quem garante isso é
// `vividos`, no slice, não um estado local aqui). Onde já existe modal
// educacional não há hint: o gatilho com tooltip não tem `licao`.
import { useDispatch, useSelector } from 'react-redux';
import { abrirEstudo, fecharHint, selectHint } from '../../features/biblioteca';
import { abrirBiblioteca } from '../../features/ui/uiSlice';
import type { AppDispatch } from '../../store';

const linha = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  fontFamily: 'inherit',
  fontSize: 10.5,
  letterSpacing: 0.5,
  cursor: 'pointer',
} as const;

export function LinhaHint() {
  const hint = useSelector(selectHint);
  const dispatch = useDispatch<AppDispatch>();
  if (!hint) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'baseline',
        justifyContent: 'center',
        flexWrap: 'wrap',
        color: 'var(--aviso)',
        fontSize: 10.5,
        marginTop: 8,
      }}
    >
      <span>{hint.licao}</span>
      {hint.estudo && (
        <button
          type="button"
          style={{ ...linha, color: 'var(--sucesso)' }}
          onClick={() => {
            dispatch(abrirEstudo(hint.estudo!.id));
            dispatch(abrirBiblioteca());
          }}
        >
          [L] ler ({hint.estudo.tempoLeituraMin} min)
        </button>
      )}
      <button
        type="button"
        style={{ ...linha, color: 'var(--texto-apagado)' }}
        onClick={() => dispatch(fecharHint())}
      >
        ✕
      </button>
    </div>
  );
}
