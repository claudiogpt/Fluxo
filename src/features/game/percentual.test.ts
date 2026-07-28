// O contrato do aporte/resgate por percentual. O engine não sabe que
// percentual existe: a conversão mora no reducer e lê o estado do momento.
import { beforeEach, describe, expect, it } from 'vitest';
import { makeStore } from '../../store';
import { abrirModal } from '../conceitos/conceitosSlice';
import { aportarPctComConceito } from '../conceitos/thunks';
import { confirmarModal } from '../conceitos/thunks';
import { aportarPct, comecar, mover, resgatarPct, valorDePct } from './gameSlice';

describe('valorDePct', () => {
  it('trunca em reais inteiros, nunca arredonda pra cima', () => {
    expect(valorDePct(1000, 33)).toBe(330);
    expect(valorDePct(1500.75, 20)).toBe(300); // 300.15 → 300
    expect(valorDePct(999, 5)).toBe(49); // 49.95 → 49
  });

  it('100% devolve a base EXATA, centavos inclusive', () => {
    expect(valorDePct(1500.75, 100)).toBe(1500.75);
  });

  it('extremos: 0% e base zerada não movem nada', () => {
    expect(valorDePct(1000, 0)).toBe(0);
    expect(valorDePct(0, 50)).toBe(0);
  });
});

describe('aportarPct / resgatarPct', () => {
  beforeEach(() => localStorage.clear());

  it('aporte usa o CAIXA como base', () => {
    const store = makeStore(); // hardcore: caixa 1500
    store.dispatch(comecar());
    store.dispatch(aportarPct({ key: 'fiis', pct: 20 }));
    const g = store.getState().game;
    expect(g.ativos.fiis).toBe(300);
    expect(g.caixa).toBe(1200);
  });

  it('resgate usa o SALDO DO ATIVO como base, não o caixa', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(mover({ key: 'fiis', valor: 1000 })); // caixa 500, fiis 1000
    store.dispatch(resgatarPct({ key: 'fiis', pct: 50 }));
    const g = store.getState().game;
    expect(g.ativos.fiis).toBe(500); // 50% de 1000, e não de 500
    expect(g.caixa).toBe(1000);
  });

  it('100% drena o pote inteiro nos dois sentidos', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(aportarPct({ key: 'fiis', pct: 100 }));
    expect(store.getState().game.caixa).toBe(0);
    store.dispatch(resgatarPct({ key: 'fiis', pct: 100 }));
    expect(store.getState().game.ativos.fiis).toBe(0);
  });

  it('percentual que dá menos de R$ 1 é no-op (guard do engine)', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(mover({ key: 'fiis', valor: 10 }));
    const antes = store.getState().game.caixa;
    store.dispatch(resgatarPct({ key: 'fiis', pct: 5 })); // 0,50 → trunca em 0
    expect(store.getState().game.caixa).toBe(antes);
  });

  it('a action guarda o PERCENTUAL, não o valor', () => {
    expect(aportarPct({ key: 'fiis', pct: 20 }).payload).toEqual({ key: 'fiis', pct: 20 });
  });
});

describe('aporte por percentual com o modal educacional', () => {
  beforeEach(() => localStorage.clear());

  it('1º aporte na reserva segura a ação e resolve o % no confirmar', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(aportarPctComConceito('reserva', 50));

    // ainda não moveu: está esperando o "entendi"
    expect(store.getState().game.ativos.reserva).toBe(0);
    expect(store.getState().conceitos.modal?.id).toBe('reserva');

    store.dispatch(confirmarModal());
    expect(store.getState().game.ativos.reserva).toBe(750); // 50% de 1500
  });

  it('o pendente recalcula contra o caixa do MOMENTO do confirmar', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(aportarPctComConceito('reserva', 50));
    // o caixa muda enquanto o modal está aberto
    store.dispatch(mover({ key: 'fiis', valor: 500 })); // caixa 1500 → 1000
    store.dispatch(confirmarModal());
    expect(store.getState().game.ativos.reserva).toBe(500); // 50% de 1000, não de 1500
  });

  it('ativo sem conceito associado aporta direto, sem modal', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(abrirModal({ id: 'x' })); // garante que não é resíduo
    store.dispatch(confirmarModal());
    store.dispatch(aportarPctComConceito('fiis', 10));
    expect(store.getState().game.ativos.fiis).toBe(150);
  });
});
