// jsdom não avalia media query: quem decide QUAL dos dois botões de glossário
// aparece é o tema.css. O que dá pra travar aqui é que os dois existem e
// despacham a MESMA action — foi o que permitiu tirar o flutuante de cima do
// jogo no celular sem duplicar comportamento.
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { comecar } from '../features/game/gameSlice';
import { makeStore } from '../store';
import { PainelStatus } from './PainelStatus';

function montar() {
  const store = makeStore();
  store.dispatch(comecar());
  render(
    <Provider store={store}>
      <PainelStatus />
    </Provider>
  );
  return store;
}

describe('PainelStatus', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('MENU e glossário vivem no mesmo wrapper, que o CSS centraliza no estreito', () => {
    montar();
    const menu = screen.getByRole('button', { name: /MENU/ });
    const glossario = screen.getByRole('button', { name: 'Abrir glossário' });
    expect(menu.parentElement).toBe(glossario.parentElement);
    expect(menu.parentElement?.className).toBe('acoes-topo');
  });

  it('o botão do cabeçalho abre o glossário (mesma action do flutuante)', () => {
    const store = montar();
    expect(store.getState().ui.glossarioAberto).toBe(false);
    screen.getByRole('button', { name: 'Abrir glossário' }).click();
    expect(store.getState().ui.glossarioAberto).toBe(true);
  });

  it('o contador do cabeçalho é curto — o longo não cabe ao lado do MENU', () => {
    montar();
    // peculium nasce desbloqueado (sempre: true); a frase fica só no flutuante
    expect(screen.getByRole('button', { name: 'Abrir glossário' }).textContent).toMatch(/^📖 \d+\/\d+$/);
  });
});
