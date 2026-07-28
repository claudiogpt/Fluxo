// O ponto central: o trilho ESCOLHE, ele não executa. Mover dinheiro só
// acontece por clique explícito — foi assim que o controle nasceu errado
// (commit no soltar) e este arquivo existe pra não voltar a ser.
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { marcarVisto } from '../features/conceitos/conceitosSlice';
import { comecar } from '../features/game/gameSlice';
import { makeStore } from '../store';
import { ControleAporte } from './ControleAporte';

function montar() {
  const store = makeStore();
  store.dispatch(comecar());
  store.dispatch(marcarVisto('reserva')); // tira o modal educacional do caminho
  render(
    <Provider store={store}>
      <ControleAporte ativo="reserva" />
    </Provider>
  );
  return store;
}

const arrastar = (v: number) =>
  fireEvent.change(screen.getByRole('slider'), { target: { value: String(v) } });

describe('ControleAporte', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('arrastar o trilho NÃO move dinheiro', () => {
    const store = montar();
    const antes = store.getState().game;
    arrastar(40);
    fireEvent.pointerUp(screen.getByRole('slider'));
    fireEvent.blur(screen.getByRole('slider'));
    expect(store.getState().game).toBe(antes); // nada foi despachado
  });

  it('cada botão mostra o valor que ele vai mover, com sua própria base', () => {
    montar(); // caixa 1500, reserva 0
    arrastar(20);
    expect(screen.getByRole('button', { name: /APORTAR R\$ 300/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /RESGATAR R\$ 0/ })).toBeDefined();
  });

  it('só o clique em APORTAR move, e só depois de escolher', () => {
    const store = montar();
    arrastar(20);
    fireEvent.click(screen.getByRole('button', { name: /APORTAR/ }));
    const g = store.getState().game;
    expect(g.ativos.reserva).toBe(300);
    expect(g.caixa).toBe(1200);
  });

  it('o percentual escolhido permanece após confirmar — nada se mexe sozinho', () => {
    const store = montar();
    arrastar(20);
    fireEvent.click(screen.getByRole('button', { name: /APORTAR/ }));
    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('20');
    // e o rótulo já reflete a base nova (20% de 1200)
    expect(screen.getByRole('button', { name: /APORTAR R\$ 240/ })).toBeDefined();
    expect(store.getState().game.caixa).toBe(1200);
  });

  it('botão sem nada pra mover fica desabilitado', () => {
    montar(); // reserva zerada
    arrastar(20);
    expect(screen.getByRole('button', { name: /RESGATAR/ })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: /APORTAR/ })).toHaveProperty('disabled', false);
  });

  it('MAX e ZERAR seguem de um toque só, sem depender do trilho', () => {
    const store = montar();
    fireEvent.click(screen.getByRole('button', { name: 'MAX' }));
    expect(store.getState().game.caixa).toBe(0);
    expect(store.getState().game.ativos.reserva).toBe(1500);
    fireEvent.click(screen.getByRole('button', { name: 'ZERAR' }));
    expect(store.getState().game.ativos.reserva).toBe(0);
    expect(store.getState().game.caixa).toBe(1500);
  });
});
