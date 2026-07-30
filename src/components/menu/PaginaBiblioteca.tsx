// BIBLIOTECA como página do menu. Durante a partida ela vira overlay
// (components/biblioteca/OverlayBiblioteca) pra não tirar o jogador da mesa.
import { useSelector } from 'react-redux';
import { BibliotecaConteudo } from '../biblioteca/BibliotecaConteudo';
import { selectSubtituloBiblioteca } from '../../features/biblioteca';
import { MenuLayout } from './MenuLayout';
import { dica } from './estilos';

export function PaginaBiblioteca() {
  const subtitulo = useSelector(selectSubtituloBiblioteca);

  return (
    <MenuLayout titulo="BIBLIOTECA" descricao={subtitulo}>
      <BibliotecaConteudo />
      <div style={{ ...dica, marginTop: 16 }}>
        nada aqui se compra com navegação: termos e estudos abrem quando aquilo acontece com você
        numa partida.
      </div>
    </MenuLayout>
  );
}
