import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { conceitos } from '../engine';
import { makeStore } from '../store';
import { marcarVisto } from '../features/conceitos/conceitosSlice';
import { Glossario } from './Glossario';

describe('Glossario', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mostra todo termo de jogo bloqueado como ??? quando nada foi visto', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <Glossario fechar={() => {}} />
      </Provider>
    );
    // derivado do engine, não contado à mão: o glossário cresce a cada
    // conceito novo e um número literal aqui só cria manutenção
    const total = Object.keys(conceitos.termos).length;
    const sempre = Object.values(conceitos.termos).filter((t) => (t as { sempre?: boolean }).sempre).length;
    expect(screen.getAllByText('???')).toHaveLength(total - sempre);
    expect(screen.getByText(`${sempre}/${total} termos desbloqueados`)).toBeTruthy();
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
    const total2 = Object.keys(conceitos.termos).length;
    const sempre2 = Object.values(conceitos.termos).filter((t) => (t as { sempre?: boolean }).sempre).length;
    const desbloqueados = conceitos.tooltips.acoes.termos.length;
    expect(screen.getAllByText('???')).toHaveLength(total2 - sempre2 - desbloqueados);
    expect(screen.getByText(`2/${Object.keys(conceitos.termos).length} termos desbloqueados`)).toBeTruthy();
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
