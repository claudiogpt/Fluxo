// O `?` do canto. É um caractere, não um botão: sem moldura, sem fundo, sem
// rótulo. Quem quer, acha; quem não quer, não tropeça. Abre o MANUAL já na
// seção da tela atual — a rota vira contexto em features/ui/ajuda.
import { useDispatch } from 'react-redux';
import { abrirAjuda } from '../../features/ui/ajuda';
import type { AppDispatch } from '../../store';

export function Ajuda() {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <button
      type="button"
      onClick={() => dispatch(abrirAjuda())}
      title="o que faço nesta tela? [?]"
      aria-label="Abrir o manual na seção desta tela"
      style={{
        position: 'fixed',
        left: 14,
        bottom: 10,
        zIndex: 60,
        background: 'transparent',
        border: 'none',
        padding: 6,
        fontFamily: 'inherit',
        fontSize: 14,
        lineHeight: 1,
        color: 'var(--texto-apagado)',
        cursor: 'pointer',
      }}
    >
      ?
    </button>
  );
}
