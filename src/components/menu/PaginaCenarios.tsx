// Lista de cenários + a faixa de TREINO. Só o CLIQUE despacha: montar a página
// não pode escolher nada, senão a simples visita montaria o sub-estado do
// cenário e trocaria o board do placar sem o jogador pedir.
//
// As duas faixas usam o mesmo cartão e o mesmo caminho de setup porque
// mecanicamente são a mesma coisa. O que separa é a promessa: cenário é uma
// situação pra atravessar; treino é uma posição ruim de propósito, com prazo.
import { useDispatch, useSelector } from 'react-redux';
import { selectCenariosLista, selectTreinosLista } from '../../features/game/selectorsMenu';
import { abrirSetupDeCenario } from '../../features/ui/thunks';
import type { AppDispatch } from '../../store';
import { CartaoEscolha } from './CartaoEscolha';
import { MenuLayout } from './MenuLayout';
import { secaoTitulo } from './estilos';

const grade = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 } as const;

export function PaginaCenarios() {
  const cenarios = useSelector(selectCenariosLista);
  const treinos = useSelector(selectTreinosLista);
  const dispatch = useDispatch<AppDispatch>();
  const escolher = (id: string) => dispatch(abrirSetupDeCenario(id));

  return (
    <MenuLayout
      titulo="CENÁRIOS"
      descricao="Situações da vida real pra atravessar com as decisões certas de alocação."
    >
      <div style={grade}>
        {cenarios.map((c) => (
          <CartaoEscolha key={c.id} item={c} aoEscolher={escolher} />
        ))}
      </div>

      <div style={{ ...secaoTitulo, marginTop: 24 }}>
        TREINO — POSIÇÕES DIFÍCEIS, OBJETIVO FECHADO
      </div>
      <div style={grade}>
        {treinos.map((t) => (
          <CartaoEscolha key={t.id} item={t} aoEscolher={escolher} />
        ))}
      </div>
    </MenuLayout>
  );
}
