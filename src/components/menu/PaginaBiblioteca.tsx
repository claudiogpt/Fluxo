// BIBLIOTECA como página do menu: o fichário inteiro, estante e tudo.
//
// Sem MenuLayout de propósito, e é a única página que abre mão dele: o layout
// de menu é uma coluna de 640px com VOLTAR em cima, e o fichário precisa da
// tela toda e já tem o próprio VOLTAR na régua das abas — dois VOLTAR na mesma
// tela seriam dois lugares dizendo a mesma coisa.
//
// Durante a partida ela vira overlay (components/biblioteca/OverlayBiblioteca),
// que continua compacto: lá a biblioteca é consulta rápida sobre a mesa.
import { Fichario } from '../biblioteca/Fichario';

export function PaginaBiblioteca() {
  return <Fichario />;
}
