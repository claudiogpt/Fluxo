// Glossário como página do menu. Durante a partida ele aparece como overlay
// flutuante (components/Glossario) pra não tirar o jogador da mesa.
import { useSelector } from 'react-redux';
import { selectContador } from '../../features/conceitos/conceitosSlice';
import { RODAPE_GLOSSARIO, TermosGlossario } from '../TermosGlossario';
import { MenuLayout } from './MenuLayout';
import { dica } from './estilos';

export function PaginaGlossario() {
  const contador = useSelector(selectContador);

  return (
    <MenuLayout titulo="GLOSSÁRIO" descricao={contador}>
      <div style={{ display: 'grid', gap: 10 }}>
        <TermosGlossario />
      </div>
      <div style={{ ...dica, marginTop: 16 }}>{RODAPE_GLOSSARIO}</div>
    </MenuLayout>
  );
}
