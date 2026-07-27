// Lista de cenários. Só o CLIQUE despacha: montar a página não pode escolher
// nada, senão a simples visita montaria o sub-estado do cenário e trocaria o
// board do placar sem o jogador pedir.
import { useDispatch, useSelector } from 'react-redux';
import { selectCenariosLista } from '../../features/game/selectorsMenu';
import { abrirSetupDeCenario } from '../../features/ui/thunks';
import type { AppDispatch } from '../../store';
import { CartaoEscolha } from './CartaoEscolha';
import { MenuLayout } from './MenuLayout';

export function PaginaCenarios() {
  const cenarios = useSelector(selectCenariosLista);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <MenuLayout
      titulo="CENÁRIOS"
      descricao="Situações da vida real pra atravessar com as decisões certas de alocação."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 }}>
        {cenarios.map((c) => (
          <CartaoEscolha key={c.id} item={c} aoEscolher={(id) => dispatch(abrirSetupDeCenario(id))} />
        ))}
      </div>
    </MenuLayout>
  );
}
