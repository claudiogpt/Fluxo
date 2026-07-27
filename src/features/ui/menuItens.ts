// Os botões do menu, declarados. Adicionar um botão no futuro:
//   1. inclua o id novo em RotaId (uiSlice.ts);
//   2. o tsc acusa o Record incompleto em MenuRouter — crie a página;
//   3. adicione a entrada aqui.
// A convenção `disponivel: false` já rende "EM BREVE" sem código novo, igual
// aos modos em engine/config.js.
import type { RotaId } from './uiSlice';

export interface ItemMenu {
  id: RotaId;
  icone: string;
  rotulo: string;
  descricao: string;
  disponivel: boolean;
}

export const ITENS_HOME: readonly ItemMenu[] = [
  {
    id: 'modos',
    icone: '▸',
    rotulo: 'MODOS DE JOGO',
    descricao: 'clássico, sandbox e empresário',
    disponivel: true,
  },
  {
    id: 'cenarios',
    icone: '◈',
    rotulo: 'CENÁRIOS',
    descricao: 'situações reais pra atravessar com as decisões certas',
    disponivel: true,
  },
  {
    id: 'config',
    icone: '⚙',
    rotulo: 'CONFIGURAÇÕES',
    descricao: 'tema, fontes, glossário e perfil',
    disponivel: true,
  },
];
