// Escolher um modo/cenário e navegar são uma ação só do ponto de vista do
// jogador. A rota 'setup' não carrega parâmetro: game.modo/game.cenario já são
// a fonte da verdade que o engine consome — duplicar o alvo criaria drift.
import { escolherCenario, escolherModo } from '../game/gameSlice';
import { comecarComConceito } from '../conceitos/thunks';
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

/** O tutorial começa sem passar pelo setup: dificuldade e capital são fixos
 *  nele (o engine força `hard=false`), e uma tela de ajustes antes da primeira
 *  partida de alguém é exatamente a fricção que o convite existe pra evitar. */
export const jogarTutorial = () => (dispatch: AppDispatch) => {
  dispatch(escolherModo('tutorial'));
  dispatch(comecarComConceito());
};
