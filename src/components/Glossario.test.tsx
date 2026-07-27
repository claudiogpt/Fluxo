import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore } from '../store';
import { marcarVisto } from '../features/conceitos/conceitosSlice';
import { Glossario } from './Glossario';

describe('Glossario', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mostra os 8 termos de jogo bloqueados como ??? quando nada foi visto', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <Glossario fechar={() => {}} />
      </Provider>
    );
    expect(screen.getAllByText('???')).toHaveLength(8); // peculium nasce aberto
    expect(screen.getByText('1/9 termos desbloqueados')).toBeTruthy();
    expect(screen.getByText('Peculium')).toBeTruthy();
  });

  it('desbloqueia ao vivo quando um tooltip é marcado como visto', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <Glossario fechar={() => {}} />
      </Provider>
    );
    act(() => {
      store.dispatch(marcarVisto('acoes')); // cita o termo volatilidade
    });
    expect(screen.getByText('Volatilidade')).toBeTruthy();
    expect(screen.getAllByText('???')).toHaveLength(7);
    expect(screen.getByText('2/9 termos desbloqueados')).toBeTruthy();
  });

  it('o botão FECHAR chama o callback', () => {
    const store = makeStore();
    const fechar = vi.fn();
    render(
      <Provider store={store}>
        <Glossario fechar={fechar} />
      </Provider>
    );
    fireEvent.click(screen.getByText('FECHAR [ESC]'));
    expect(fechar).toHaveBeenCalledOnce();
  });
});
