// Integração do menu: percorre as telas como o jogador percorre.
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { placar } from '../../engine';
import { makeStore } from '../../store';
import { selectRota } from '../../features/ui/uiSlice';
import { MenuRouter } from './MenuRouter';

type Store = ReturnType<typeof makeStore>;

function montar(): Store {
  const store = makeStore();
  render(
    <Provider store={store}>
      <MenuRouter />
    </Provider>
  );
  return store;
}

const clicar = (nome: RegExp) => fireEvent.click(screen.getByRole('button', { name: nome }));

describe('navegação do menu', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('a home apresenta o jogo e oferece quatro caminhos', () => {
    montar();
    expect(screen.getByRole('heading', { name: /PECULIUM/ })).toBeDefined();
    // o significado da palavra vive só no glossário, não na landing
    expect(screen.queryByText(/direito romano/)).toBeNull();
    expect(screen.getByText(/Todo mês entra salário/)).toBeDefined(); // as regras
    const menu = screen.getByRole('navigation', { name: /Menu principal/ });
    expect(within(menu).getAllByRole('button')).toHaveLength(4);
  });

  it('MODOS DE JOGO não lista CENÁRIOS (que é botão de primeiro nível)', () => {
    montar();
    clicar(/MODOS DE JOGO/);
    expect(screen.getByRole('button', { name: /CLÁSSICO/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /SANDBOX/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /EMPRESÁRIO/ })).toBeDefined();
    expect(screen.queryByRole('button', { name: /^CENÁRIOS/ })).toBeNull();
  });

  it('escolher um modo abre o setup dele, e VOLTAR retorna à lista', () => {
    const store = montar();
    clicar(/MODOS DE JOGO/);
    clicar(/SANDBOX/);
    expect(selectRota(store.getState())).toBe('setup');
    expect(store.getState().game.modo).toBe('sandbox');
    expect(screen.getByText('CAPITAL INICIAL')).toBeDefined(); // ajuste só do sandbox

    clicar(/VOLTAR/);
    expect(selectRota(store.getState())).toBe('modos');
  });

  it('INICIAR sai do menu pro jogo', () => {
    const store = montar();
    clicar(/MODOS DE JOGO/);
    clicar(/CLÁSSICO/);
    clicar(/INICIAR SIMULAÇÃO/);
    expect(store.getState().game.tela).toBe('jogo');
  });

  it('o setup mostra só os ajustes do modo escolhido', () => {
    montar();
    clicar(/MODOS DE JOGO/);
    clicar(/EMPRESÁRIO/);
    expect(screen.getByText('DIFICULDADE')).toBeDefined();
    expect(screen.queryByText('CAPITAL INICIAL')).toBeNull();
    expect(screen.queryByText('MODO DE SAQUE')).toBeNull();
  });

  it('cenário escolhido a partir de outro modo entra no modo cenarios', () => {
    const store = montar();
    // primeiro passa pelo sandbox, o caminho que antes descartava o cenário
    clicar(/MODOS DE JOGO/);
    clicar(/SANDBOX/);
    clicar(/VOLTAR/);
    clicar(/VOLTAR/);
    clicar(/CENÁRIOS/);
    clicar(/IMÓVEIS/);

    const g = store.getState().game;
    expect(g.modo).toBe('cenarios');
    expect(g.cenario).toBe('imoveis');
    expect(g.imoveis).not.toBeNull();
    expect(placar.boardDe(g)).toBe('imoveis'); // board próprio do cenário
    expect(screen.getByText('ESTRATÉGIA DE MORADIA')).toBeDefined();
  });

  it('BIBLIOTECA é uma página do menu, com o significado de Peculium', () => {
    const store = montar();
    clicar(/BIBLIOTECA/);
    expect(selectRota(store.getState())).toBe('biblioteca');
    expect(store.getState().ui.bibliotecaAberta).toBe(false); // página, não overlay
    expect(screen.getByText('Peculium')).toBeDefined();
    expect(screen.getByText(/direito romano/)).toBeDefined();
  });

  it('a aposentadoria traz o ajuste de saque', () => {
    montar();
    clicar(/CENÁRIOS/);
    clicar(/APOSENTADORIA/);
    expect(screen.getByText('MODO DE SAQUE')).toBeDefined();
    expect(screen.queryByText('ESTRATÉGIA DE MORADIA')).toBeNull();
  });
});
