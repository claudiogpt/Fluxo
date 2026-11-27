// Lista de modos. O pseudo-modo 'cenarios' não aparece aqui — ele é um botão
// de primeiro nível na home (o filtro mora no selector, não no JSX).
import { useDispatch, useSelector } from 'react-redux';
import { selectModosLista } from '../../features/game/selectorsMenu';
import { abrirSetupDeModo } from '../../features/ui/thunks';
import type { AppDispatch } from '../../store';
import { CartaoEscolha } from './CartaoEscolha';
import { MenuLayout } from './MenuLayout';

export function PaginaModos() {
  const modos = useSelector(selectModosLista);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <MenuLayout titulo="MODOS DE JOGO" descricao="Escolha como quer jogar. Cada modo tem seu próprio placar.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 }}>
        {modos.map((m) => (
          <CartaoEscolha key={m.id} item={m} aoEscolher={(id) => dispatch(abrirSetupDeModo(id))} />
        ))}
      </div>
    </MenuLayout>
  );
}
