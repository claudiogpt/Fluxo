// O `?` contextual: abre o MANUAL já na seção que responde pela tela em que o
// jogador está. Um caractere, não um botão — e nunca uma tela de ajuda genérica
// onde ele teria que procurar.
//
// O mapa rota → contexto mora aqui, e não no manual: o manual não deve saber
// que existe um uiSlice. Ele declara `contextos`, esta camada traduz.
import { secoesDoContexto, type ContextoAjuda } from '../../conteudo';
import type { GameState } from '../../engine/types';
import { abrirPrateleira, abrirSecao } from '../biblioteca';
import { abrirBiblioteca, irPara, selectRota, type RotaId, type UiState } from './uiSlice';
import type { AppDispatch, RootState } from '../../store';

const POR_ROTA: Record<RotaId, ContextoAjuda> = {
  home: 'menu',
  modos: 'modos',
  cenarios: 'cenarios',
  setup: 'setup',
  biblioteca: 'biblioteca',
  config: 'config',
  // o perfil é uma sub-tela de configurações; não merece seção própria
  perfil: 'config',
};

type ComUiEGame = { ui: UiState; game: GameState };

export const selectContextoAjuda = (s: ComUiEGame): ContextoAjuda =>
  s.game.tela === 'jogo' ? 'jogo' : POR_ROTA[selectRota(s)];

/** Uma ação só do ponto de vista do jogador: "me explica esta tela". Durante a
 *  partida a biblioteca vem como overlay; no menu, como página. */
export const abrirAjuda = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const s = getState();
  const secao = secoesDoContexto(selectContextoAjuda(s))[0];
  dispatch(abrirPrateleira('manual'));
  if (secao) dispatch(abrirSecao(secao.id));
  if (s.game.tela === 'jogo') dispatch(abrirBiblioteca());
  else if (selectRota(s) !== 'biblioteca') dispatch(irPara('biblioteca'));
};
