// A camada 3 do tutorial só cumpre o que promete se for MESMO uma linha: sem
// overlay, sem pausar, sem exigir clique. É isso que este teste guarda.
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it } from 'vitest';
import { viveu } from '../../features/biblioteca';
import { makeStore } from '../../store';
import { LinhaHint } from './LinhaHint';

type Store = ReturnType<typeof makeStore>;

const montar = (preparar?: (s: Store) => void): Store => {
  const store = makeStore();
  preparar?.(store);
  render(
    <Provider store={store}>
      <LinhaHint />
    </Provider>
  );
  return store;
};

describe('LinhaHint', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('sem gatilho vivido, não renderiza nada', () => {
    montar();
    expect(document.body.textContent).toBe('');
  });

  it('mostra a lição do gatilho, e só ela quando não há estudo pra oferecer', () => {
    montar((s) => s.dispatch(viveu('inflacaoComeSalario')));
    expect(screen.getByText(/custo de vida subiu acima do salário/i)).toBeDefined();
    // hoje nenhum gatilho com lição tem estudo (os dois estudos existentes vêm
    // de gatilhos COM tooltip): sem par, o convite simplesmente não aparece
    expect(screen.queryByText(/\[L\]/)).toBeNull();
  });

  it('o ✕ fecha a linha sem desfazer o desbloqueio', () => {
    const store = montar((s) => s.dispatch(viveu('saldoNegativo')));
    fireEvent.click(screen.getByText('✕'));
    expect(store.getState().biblioteca.hintAtual).toBeNull();
    expect(store.getState().biblioteca.vividos).toEqual(['saldoNegativo']);
  });

  it('o jogo NÃO pausa: nenhum overlay, nenhuma mudança no auto', () => {
    const store = montar((s) => {
      s.dispatch(viveu('saldoNegativo'));
    });
    expect(store.getState().ui.bibliotecaAberta).toBe(false);
    expect(store.getState().game.auto).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
