import { beforeEach, describe, expect, it } from 'vitest';
import { makeStore } from '../../store';
import { aplicarPrefs } from './aplicar';
import { CHAVE_PREFS, lerPrefs } from './armazenamento';
import { setEscala, setFonte, setTema } from './prefsSlice';
import { PREFS_PADRAO } from './tipos';

describe('prefsSlice', () => {
  beforeEach(() => localStorage.clear());

  it('começa no padrão: escuro, mono, normal', () => {
    expect(makeStore().getState().prefs).toEqual(PREFS_PADRAO);
  });

  it('mudar uma preferência persiste o conjunto', () => {
    const store = makeStore();
    store.dispatch(setTema('claro'));
    store.dispatch(setEscala('grande'));
    expect(JSON.parse(localStorage.getItem(CHAVE_PREFS)!)).toEqual({
      tema: 'claro',
      fonte: 'mono',
      escala: 'grande',
    });
  });

  it('store novo restaura o que ficou salvo', () => {
    const a = makeStore();
    a.dispatch(setFonte('sans'));
    expect(makeStore().getState().prefs.fonte).toBe('sans');
  });

  it('valor inválido no storage cai no padrão em vez de quebrar o CSS', () => {
    localStorage.setItem(CHAVE_PREFS, JSON.stringify({ tema: 'roxo', escala: 'gigante', fonte: 'sans' }));
    expect(lerPrefs()).toEqual({ tema: 'escuro', fonte: 'sans', escala: 'normal' });
  });

  it('JSON corrompido não lança', () => {
    localStorage.setItem(CHAVE_PREFS, '{isso não é json');
    expect(lerPrefs()).toEqual(PREFS_PADRAO);
  });
});

describe('aplicarPrefs', () => {
  it('escreve os três atributos no <html>', () => {
    aplicarPrefs({ tema: 'claro', fonte: 'sans', escala: 'compacto' });
    const d = document.documentElement.dataset;
    expect([d.tema, d.fonte, d.escala]).toEqual(['claro', 'sans', 'compacto']);
    aplicarPrefs(PREFS_PADRAO); // idempotente: reaplica sem acumular
    expect(document.documentElement.dataset.tema).toBe('escuro');
  });
});
