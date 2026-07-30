import { beforeEach, describe, expect, it } from 'vitest';
import { makeStore } from '../../store';
import { aplicarPrefs } from './aplicar';
import { CHAVE_PREFS, lerPrefs } from './armazenamento';
import { setContraste, setEscala, setFonte, setTema, setVisao } from './prefsSlice';
import { PREFS_PADRAO } from './tipos';

describe('prefsSlice', () => {
  beforeEach(() => localStorage.clear());

  it('começa no padrão: escuro, mono, normal, sem ajuste de acessibilidade', () => {
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
      contraste: 'normal',
      visao: 'padrao',
    });
  });

  it('contraste e visão são eixos independentes — combinam entre si', () => {
    const store = makeStore();
    store.dispatch(setContraste('alto'));
    store.dispatch(setVisao('daltonico'));
    const p = store.getState().prefs;
    expect([p.contraste, p.visao, p.tema]).toEqual(['alto', 'daltonico', 'escuro']);
  });

  it('store novo restaura o que ficou salvo', () => {
    const a = makeStore();
    a.dispatch(setFonte('sans'));
    expect(makeStore().getState().prefs.fonte).toBe('sans');
  });

  it('valor inválido no storage cai no padrão em vez de quebrar o CSS', () => {
    localStorage.setItem(
      CHAVE_PREFS,
      JSON.stringify({ tema: 'roxo', escala: 'gigante', fonte: 'sans', visao: 'raio-x' })
    );
    expect(lerPrefs()).toEqual({
      tema: 'escuro',
      fonte: 'sans',
      escala: 'normal',
      contraste: 'normal',
      visao: 'padrao',
    });
  });

  it('prefs salvas antes dos eixos de acessibilidade ganham o padrão deles', () => {
    localStorage.setItem(CHAVE_PREFS, JSON.stringify({ tema: 'claro', fonte: 'mono', escala: 'normal' }));
    const p = lerPrefs();
    expect([p.tema, p.contraste, p.visao]).toEqual(['claro', 'normal', 'padrao']);
  });

  it('JSON corrompido não lança', () => {
    localStorage.setItem(CHAVE_PREFS, '{isso não é json');
    expect(lerPrefs()).toEqual(PREFS_PADRAO);
  });
});

describe('aplicarPrefs', () => {
  it('escreve os cinco atributos no <html>', () => {
    aplicarPrefs({
      tema: 'claro',
      fonte: 'sans',
      escala: 'compacto',
      contraste: 'alto',
      visao: 'daltonico',
    });
    const d = document.documentElement.dataset;
    expect([d.tema, d.fonte, d.escala, d.contraste, d.visao]).toEqual([
      'claro',
      'sans',
      'compacto',
      'alto',
      'daltonico',
    ]);
    aplicarPrefs(PREFS_PADRAO); // idempotente: reaplica sem acumular
    expect([d.tema, d.contraste, d.visao]).toEqual(['escuro', 'normal', 'padrao']);
  });
});
