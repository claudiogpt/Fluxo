import { beforeEach, describe, expect, it } from 'vitest';
import { makeStore } from '../../store';
import { comecar, escolherModo, voltarMenu } from '../game/gameSlice';
import {
  abrirGlossario,
  alternarGlossario,
  irPara,
  irParaHome,
  selectPodeVoltar,
  selectRota,
  voltar,
} from './uiSlice';
import { abrirSetupDeCenario, abrirSetupDeModo } from './thunks';

describe('uiSlice — pilha de navegação', () => {
  beforeEach(() => localStorage.clear());

  it('começa na home, sem poder voltar', () => {
    const store = makeStore();
    expect(selectRota(store.getState())).toBe('home');
    expect(selectPodeVoltar(store.getState())).toBe(false);
  });

  it('irPara empilha e voltar desempilha', () => {
    const store = makeStore();
    store.dispatch(irPara('config'));
    store.dispatch(irPara('perfil'));
    expect(selectRota(store.getState())).toBe('perfil');
    store.dispatch(voltar());
    expect(selectRota(store.getState())).toBe('config');
    store.dispatch(voltar());
    expect(selectRota(store.getState())).toBe('home');
  });

  it('voltar na home é no-op — a pilha nunca esvazia', () => {
    const store = makeStore();
    store.dispatch(voltar());
    store.dispatch(voltar());
    expect(selectRota(store.getState())).toBe('home');
    expect(store.getState().ui.pilha).toEqual(['home']);
  });

  it('irPara na rota atual não duplica', () => {
    const store = makeStore();
    store.dispatch(irPara('modos'));
    store.dispatch(irPara('modos'));
    expect(store.getState().ui.pilha).toEqual(['home', 'modos']);
  });

  it('irParaHome reseta de qualquer profundidade', () => {
    const store = makeStore();
    store.dispatch(irPara('config'));
    store.dispatch(irPara('perfil'));
    store.dispatch(irParaHome());
    expect(store.getState().ui.pilha).toEqual(['home']);
  });

  it('voltarMenu (do jogo) reseta a pilha e fecha o glossário', () => {
    const store = makeStore();
    store.dispatch(irPara('modos'));
    store.dispatch(irPara('setup'));
    store.dispatch(comecar());
    store.dispatch(abrirGlossario());
    store.dispatch(voltarMenu());
    expect(store.getState().ui.pilha).toEqual(['home']);
    expect(store.getState().ui.glossarioAberto).toBe(false);
  });

  it('começar a partida fecha o glossário', () => {
    const store = makeStore();
    store.dispatch(abrirGlossario());
    store.dispatch(comecar());
    expect(store.getState().ui.glossarioAberto).toBe(false);
  });

  it('alternarGlossario abre e fecha', () => {
    const store = makeStore();
    store.dispatch(alternarGlossario());
    expect(store.getState().ui.glossarioAberto).toBe(true);
    store.dispatch(alternarGlossario());
    expect(store.getState().ui.glossarioAberto).toBe(false);
  });
});

describe('thunks de setup', () => {
  it('abrirSetupDeModo escolhe o modo e navega', () => {
    const store = makeStore();
    store.dispatch(abrirSetupDeModo('sandbox'));
    expect(store.getState().game.modo).toBe('sandbox');
    expect(selectRota(store.getState())).toBe('setup');
  });

  it('abrirSetupDeCenario funciona vindo de outro modo', () => {
    const store = makeStore();
    store.dispatch(escolherModo('sandbox'));
    store.dispatch(abrirSetupDeCenario('imoveis'));
    expect(selectRota(store.getState())).toBe('setup');
    expect(store.getState().game.cenario).toBe('imoveis');
  });
});
