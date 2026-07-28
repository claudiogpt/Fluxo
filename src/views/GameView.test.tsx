// As abas só têm efeito visual abaixo de 900px (o CSS decide), e jsdom não
// avalia media query — então o que dá pra garantir aqui é o CONTRATO: um
// painel ativo por vez, e trocar de aba não encosta no estado do jogo.
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { comecar } from '../features/game/gameSlice';
import { makeStore } from '../store';
import { GameView } from './GameView';

function montar() {
  const store = makeStore();
  store.dispatch(comecar());
  const { container } = render(
    <Provider store={store}>
      <GameView />
    </Provider>
  );
  return { store, container };
}

const ativos = (c: HTMLElement) =>
  [...c.querySelectorAll('.jogo-painel')].map((p) => p.getAttribute('data-ativa'));

describe('abas da tela de jogo', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('começa em ATIVOS, com exatamente um painel ativo', () => {
    const { container } = montar();
    expect(ativos(container)).toEqual(['sim', 'nao', 'nao']);
  });

  it('trocar de aba move o ativo, sempre um só', () => {
    const { container } = montar();
    fireEvent.click(screen.getByRole('tab', { name: 'PLACAR' }));
    expect(ativos(container)).toEqual(['nao', 'nao', 'sim']);
    fireEvent.click(screen.getByRole('tab', { name: 'EVENTOS' }));
    expect(ativos(container)).toEqual(['nao', 'sim', 'nao']);
  });

  it('trocar de aba não mexe no estado do jogo', () => {
    const { store } = montar();
    const antes = store.getState().game;
    fireEvent.click(screen.getByRole('tab', { name: 'PLACAR' }));
    expect(store.getState().game).toBe(antes);
  });

  it('a ação de fechar o mês vive FORA dos painéis — não some ao trocar de aba', () => {
    const { container, store } = montar();
    fireEvent.click(screen.getByRole('tab', { name: 'PLACAR' }));
    const acao = screen.getByRole('button', { name: /FECHAR O MÊS/ });
    expect(container.querySelector('.jogo-painel')?.contains(acao)).toBe(false);
    fireEvent.click(acao);
    expect(store.getState().game.mes).toBe(1);
  });
});
