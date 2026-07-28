// Navegação do MENU (a tela de jogo continua sendo decidida por game.tela,
// que pertence ao engine). É uma PILHA, não uma rota plana, porque 'setup'
// tem dois pais — MODOS e CENÁRIOS — e o VOLTAR precisa saber de onde veio
// sem consultar o estado do jogo.
//
// Sem react-router de propósito: o app é um index.html estático, são poucas
// telas e não há partida linkável (o jogo é não determinístico). Um router
// só criaria um segundo lugar onde "onde estou" vive.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { comecar, voltarMenu } from '../game/gameSlice';

export type RotaId = 'home' | 'modos' | 'cenarios' | 'setup' | 'glossario' | 'config' | 'perfil';

export interface UiState {
  /** pilha de navegação; o índice 0 é sempre 'home' e nunca sai */
  pilha: RotaId[];
  glossarioAberto: boolean;
}

const inicial: UiState = { pilha: ['home'], glossarioAberto: false };

const uiSlice = createSlice({
  name: 'ui',
  initialState: inicial,
  reducers: {
    irPara(state, action: PayloadAction<RotaId>) {
      if (state.pilha[state.pilha.length - 1] !== action.payload) state.pilha.push(action.payload);
    },
    voltar(state) {
      if (state.pilha.length > 1) state.pilha.pop();
    },
    irParaHome(state) {
      state.pilha = ['home'];
    },
    abrirGlossario(state) {
      state.glossarioAberto = true;
    },
    fecharGlossario(state) {
      state.glossarioAberto = false;
    },
    alternarGlossario(state) {
      state.glossarioAberto = !state.glossarioAberto;
    },
  },
  extraReducers: (builder) => {
    // Voltar do jogo pro menu recomeça na home, sem overlay aberto.
    builder.addCase(voltarMenu, (state) => {
      state.pilha = ['home'];
      state.glossarioAberto = false;
    });
    builder.addCase(comecar, (state) => {
      state.glossarioAberto = false;
    });
  },
});

export const { irPara, voltar, irParaHome, abrirGlossario, fecharGlossario, alternarGlossario } =
  uiSlice.actions;
export const uiReducer = uiSlice.reducer;

type ComUi = { ui: UiState };
export const selectRota = (s: ComUi): RotaId => s.ui.pilha[s.ui.pilha.length - 1];
export const selectPodeVoltar = (s: ComUi) => s.ui.pilha.length > 1;
export const selectGlossarioAberto = (s: ComUi) => s.ui.glossarioAberto;
