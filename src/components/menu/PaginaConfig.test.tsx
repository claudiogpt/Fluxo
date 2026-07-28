// Configurações: cada controle tem que chegar no <html>, que é onde o
// tema.css lê. Testar o store não bastaria — a ponte é o efeito do usePrefs.
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Provider } from 'react-redux';
import { placar } from '../../engine';
import { CHAVE_PREFS } from '../../features/prefs';
import { irPara, selectRota } from '../../features/ui/uiSlice';
import { makeStore } from '../../store';
import { App } from '../../App';

type Store = ReturnType<typeof makeStore>;

function montarEmConfig(): Store {
  const store = makeStore();
  store.dispatch(irPara('config'));
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  return store;
}

const clicar = (nome: RegExp) => fireEvent.click(screen.getByRole('button', { name: nome }));

describe('CONFIGURAÇÕES', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('data-tema');
  });

  it('CLARO troca o tema no <html> e persiste', () => {
    montarEmConfig();
    clicar(/CLARO/);
    expect(document.documentElement.dataset.tema).toBe('claro');
    expect(JSON.parse(localStorage.getItem(CHAVE_PREFS)!).tema).toBe('claro');
  });

  it('GRANDE e SEM SERIFA chegam no <html>', () => {
    montarEmConfig();
    clicar(/GRANDE/);
    clicar(/SEM SERIFA/);
    expect(document.documentElement.dataset.escala).toBe('grande');
    expect(document.documentElement.dataset.fonte).toBe('sans');
  });

  it('o glossário não mora mais aqui — é botão da home', () => {
    montarEmConfig();
    expect(screen.queryByRole('button', { name: /GLOSSÁRIO/ })).toBeNull();
  });

  it('no menu não existe glossário flutuante — só durante a partida', () => {
    montarEmConfig();
    expect(screen.queryByText(/termos desbloqueados \[G\]/)).toBeNull();
  });

  it('PERFIL navega e o nick digitado persiste', () => {
    const store = montarEmConfig();
    clicar(/PERFIL/);
    expect(selectRota(store.getState())).toBe('perfil');
    fireEvent.change(screen.getByLabelText('Nome no placar'), { target: { value: 'claudio' } });
    expect(store.getState().placar.nick).toBe('CLAUDIO'); // normaliza pra maiúscula
    expect(localStorage.getItem(placar.CHAVE_NICK)).toBe('CLAUDIO'); // persistido pelo listener
  });
});
