// O useAtalhos nunca teve teste e é o ponto mais frágil do app: uma cadeia de
// guards que só falha em runtime, e sempre de um jeito silencioso.
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { comecar } from '../features/game/gameSlice';
import { abrirGlossario, irPara, selectRota } from '../features/ui/uiSlice';
import { makeStore } from '../store';
import { useAtalhos } from './useAtalhos';

type Store = ReturnType<typeof makeStore>;

function Sonda() {
  useAtalhos();
  return <input data-testid="campo" />;
}

function montar(): Store {
  const store = makeStore();
  render(
    <Provider store={store}>
      <Sonda />
    </Provider>
  );
  return store;
}

const tecla = (init: KeyboardEventInit & { alvo?: Element }) => {
  const { alvo, ...resto } = init;
  (alvo ?? window).dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...resto })
  );
};

describe('useAtalhos', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('G abre e fecha o glossário', () => {
    const store = montar();
    tecla({ code: 'KeyG', key: 'g' });
    expect(store.getState().ui.glossarioAberto).toBe(true);
    tecla({ code: 'KeyG', key: 'g' });
    expect(store.getState().ui.glossarioAberto).toBe(false);
  });

  it('digitar num input não dispara atalho', () => {
    const store = montar();
    const campo = document.querySelector('[data-testid="campo"]')!;
    tecla({ code: 'KeyG', key: 'g', alvo: campo });
    expect(store.getState().ui.glossarioAberto).toBe(false);
  });

  it('ESC fecha o glossário e não navega', () => {
    const store = montar();
    store.dispatch(irPara('config'));
    store.dispatch(abrirGlossario());
    tecla({ code: 'Escape', key: 'Escape' });
    expect(store.getState().ui.glossarioAberto).toBe(false);
    expect(selectRota(store.getState())).toBe('config'); // não voltou junto
  });

  it('ESC no menu volta uma tela', () => {
    const store = montar();
    store.dispatch(irPara('config'));
    store.dispatch(irPara('perfil'));
    tecla({ code: 'Escape', key: 'Escape' });
    expect(selectRota(store.getState())).toBe('config');
  });

  it('ESC na home é no-op', () => {
    const store = montar();
    tecla({ code: 'Escape', key: 'Escape' });
    expect(selectRota(store.getState())).toBe('home');
  });

  it('ESPAÇO no menu não fecha o mês', () => {
    const store = montar();
    tecla({ code: 'Space', key: ' ' });
    expect(store.getState().game.mes).toBe(0);
    expect(store.getState().game.tela).toBe('intro');
  });

  it('no jogo, ESPAÇO fecha o mês e A alterna o auto', () => {
    const store = montar();
    store.dispatch(comecar());
    tecla({ code: 'Space', key: ' ' });
    expect(store.getState().game.mes).toBe(1);
    tecla({ code: 'KeyA', key: 'a' });
    expect(store.getState().game.auto).toBe(true);
  });

  it('reconhece a tecla só por e.key (teclado não-QWERTY)', () => {
    const store = montar();
    tecla({ key: 'G' });
    expect(store.getState().ui.glossarioAberto).toBe(true);
  });
});
