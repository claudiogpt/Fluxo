// As abas só têm efeito visual abaixo de 900px (o CSS decide), e jsdom não
// avalia media query — então o que dá pra garantir aqui é o CONTRATO: um
// painel ativo por vez, e trocar de aba não encosta no estado do jogo.
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { comecar, escolherModo } from '../features/game/gameSlice';
import { makeStore } from '../store';
import { GameView } from './GameView';

function montar(modo?: string) {
  const store = makeStore();
  if (modo) store.dispatch(escolherModo(modo));
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

// O drill-down do realista vive DENTRO do painel de conteúdo que já existe:
// se ele criasse painel novo, as abas do celular passariam a mostrar a
// carteira em cima do terminal de eventos.
describe('carteira por categoria (modo realista)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('começa nas categorias; entrar mostra os ativos e VOLTAR retorna', () => {
    montar('realista');
    // nível 1: as 5 categorias, nenhum card de ativo
    expect(screen.getByRole('button', { name: /RENDA FIXA/ })).toBeTruthy();
    expect(screen.queryByText('TESOURO SELIC')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /RENDA FIXA/ }));
    // nível 2: os 5 papéis da categoria
    expect(screen.getByText('TESOURO SELIC')).toBeTruthy();
    expect(screen.getByText('LCI/LCA 95% DO CDI')).toBeTruthy();
    expect(screen.queryByText('BITCOIN')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '◂ CARTEIRA' }));
    expect(screen.queryByText('TESOURO SELIC')).toBeNull();
  });

  it('o drill-down não cria painel novo: seguem 3, e a navegação não toca no jogo', () => {
    const { container, store } = montar('realista');
    const antes = store.getState().game;
    expect(container.querySelectorAll('.jogo-painel').length).toBe(3);
    fireEvent.click(screen.getByRole('button', { name: /CRIPTO/ }));
    expect(container.querySelectorAll('.jogo-painel').length).toBe(3);
    expect(ativos(container)).toEqual(['sim', 'nao', 'nao']);
    expect(store.getState().game).toBe(antes);
  });

  it('aportar pela subtela move o dinheiro pro ativo certo', () => {
    const { store } = montar('realista');
    fireEvent.click(screen.getByRole('button', { name: /INTERNACIONAL/ }));
    // MAX do primeiro card da categoria: S&P 500
    fireEvent.click(screen.getAllByRole('button', { name: 'MAX' })[0]);
    expect(store.getState().game.ativos.int_sp500).toBeGreaterThan(0);
    expect(store.getState().game.caixa).toBe(0);
  });
});
