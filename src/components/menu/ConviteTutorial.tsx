// Camada 2 do tutorial: o convite. Uma linha na home, na primeira sessão.
//
// Tudo o que ele NÃO é: modal, tela de boas-vindas, checkbox "não mostrar de
// novo" dentro de um diálogo, badge piscando. É uma linha de texto com duas
// teclas — e o [X] a apaga pra sempre. Se o jogador ignorar, ela some sozinha
// assim que ele viver qualquer coisa numa partida.
import { useDispatch, useSelector } from 'react-redux';
import { dispensarConvite, selectConviteTutorial } from '../../features/biblioteca';
import { jogarTutorial } from '../../features/ui/thunks';
import type { AppDispatch } from '../../store';

const tecla = {
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  cursor: 'pointer',
} as const;

export function ConviteTutorial() {
  const mostrar = useSelector(selectConviteTutorial);
  const dispatch = useDispatch<AppDispatch>();
  if (!mostrar) return null;

  return (
    <div
      style={{
        color: 'var(--texto-apagado)',
        fontSize: 11,
        marginBottom: 14,
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        alignItems: 'baseline',
      }}
    >
      <span>primeira vez? o tutorial leva 4 min</span>
      <button style={{ ...tecla, color: 'var(--sucesso)' }} onClick={() => dispatch(jogarTutorial())}>
        [T] jogar tutorial
      </button>
      <button style={{ ...tecla, color: 'var(--texto-apagado)' }} onClick={() => dispatch(dispensarConvite())}>
        [X] não mostrar
      </button>
    </div>
  );
}
