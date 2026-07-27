// Escolher um modo/cenário e navegar são uma ação só do ponto de vista do
// jogador. A rota 'setup' não carrega parâmetro: game.modo/game.cenario já são
// a fonte da verdade que o engine consome — duplicar o alvo criaria drift.
import { escolherCenario, escolherModo } from '../game/gameSlice';
import { irPara } from './uiSlice';
import type { AppDispatch } from '../../store';

export const abrirSetupDeModo = (id: string) => (dispatch: AppDispatch) => {
  dispatch(escolherModo(id));
  dispatch(irPara('setup'));
};

export const abrirSetupDeCenario = (id: string) => (dispatch: AppDispatch) => {
  dispatch(escolherCenario(id));
  dispatch(irPara('setup'));
};
