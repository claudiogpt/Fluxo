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
    descricao: 'tutorial, clássico, realista, sandbox e empresário',
    disponivel: true,
  },
  {
    id: 'cenarios',
    icone: '◈',
    rotulo: 'CENÁRIOS',
    descricao: 'situações reais · treino',
    disponivel: true,
  },
  {
    id: 'biblioteca',
    icone: '📚',
    // a Home troca esta descrição pelo selectSubtituloBiblioteca, que conta os
    // termos e só então acrescenta "· N estudos novos" — o único elemento de
    // descoberta do menu, e ele some quando não há nada novo pra ler.
    rotulo: 'BIBLIOTECA',
    descricao: 'glossário, manual e fundamentos',
    disponivel: true,
  },
  {
    id: 'config',
    icone: '⚙',
    rotulo: 'CONFIGURAÇÕES',
    descricao: 'tema, fontes e perfil',
    disponivel: true,
  },
];
