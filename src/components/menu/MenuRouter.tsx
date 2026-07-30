// Roteador do menu. O Record é EXAUSTIVO de propósito: incluir um id novo em
// RotaId sem criar a página vira erro de compilação, não tela em branco.
import type { ComponentType } from 'react';
import { useSelector } from 'react-redux';
import { selectRota, type RotaId } from '../../features/ui/uiSlice';
import { Home } from './Home';
import { PaginaBiblioteca } from './PaginaBiblioteca';
import { PaginaCenarios } from './PaginaCenarios';
import { PaginaConfig } from './PaginaConfig';
import { PaginaModos } from './PaginaModos';
import { PaginaPerfil } from './PaginaPerfil';
import { PaginaSetup } from './PaginaSetup';

const PAGINAS: Record<RotaId, ComponentType> = {
  home: Home,
  modos: PaginaModos,
  cenarios: PaginaCenarios,
  setup: PaginaSetup,
  biblioteca: PaginaBiblioteca,
  config: PaginaConfig,
  perfil: PaginaPerfil,
};

export function MenuRouter() {
  const rota = useSelector(selectRota);
  const Pagina = PAGINAS[rota];
  return <Pagina />;
}
