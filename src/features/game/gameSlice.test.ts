import { beforeEach, describe, expect, it } from 'vitest';
import { makeStore } from '../../store';
import {
  comecar,
  escolherCapital,
  escolherCenario,
  escolherModo,
  fecharMes,
  mover,
  reiniciar,
  voltarMenu,
} from './gameSlice';
import { selectAtivosLista, selectPainel } from './selectors';

// Mesmo padrão dos testes do engine: rng determinístico — 10 chamadas 0.5
// (retorno médio de cada ativo) e 0.99 no sorteio de evento (não sorteia).
function rngNeutro() {
  const vals = [...Array(10).fill(0.5), 0.99];
  let i = 0;
  return () => (i < vals.length ? vals[i++] : vals[vals.length - 1]);
}

describe('gameSlice', () => {
  beforeEach(() => localStorage.clear());

  it('estado inicial: hardcore, intro, caixa 1500', () => {
    const store = makeStore();
    const g = store.getState().game;
    expect(g.tela).toBe('intro');
    expect(g.dificuldade).toBe('hardcore');
    expect(g.caixa).toBe(1500);
    expect(g.custo).toBe(3420);
  });

  it('fecharMes neutro: salário entra, custo sai, mês avança', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(fecharMes({ rng: rngNeutro() }));
    const g = store.getState().game;
    expect(g.mes).toBe(1);
    expect(g.caixa).toBe(1500 + 4500 - 3420);
    expect(g.fim).toBeNull();
  });

  it('mover faz merge parcial (aporte tira do caixa, entra no ativo)', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(mover({ key: 'reserva', valor: 500 }));
    const g = store.getState().game;
    expect(g.caixa).toBe(1000);
    expect(g.ativos.reserva).toBe(500);
    // demais campos preservados pelo merge
    expect(g.mes).toBe(0);
    expect(g.tela).toBe('jogo');
  });

  it('fecharMes depois do fim é no-op (guard do orquestrador)', () => {
    const store = makeStore();
    store.dispatch(comecar());
    // força uma falência: caixa estoura sem ativos pra liquidar
    for (let i = 0; i < 200 && !store.getState().game.fim; i++) {
      store.dispatch(mover({ key: 'cripto', valor: store.getState().game.caixa }));
      store.dispatch(fecharMes({ rng: (() => { const v = [...Array(10).fill(0.01), 0.99]; let j = 0; return () => (j < v.length ? v[j++] : 0.99); })() }));
    }
    const antes = store.getState().game;
    if (antes.fim) {
      store.dispatch(fecharMes({ rng: rngNeutro() }));
      expect(store.getState().game.mes).toBe(antes.mes); // não avançou
    }
  });

  it('reiniciar preserva modo/dificuldade/capital escolhidos no menu', () => {
    const store = makeStore();
    store.dispatch(escolherModo('sandbox'));
    store.dispatch(escolherCapital(100000));
    expect(store.getState().game.caixa).toBe(100000);
    store.dispatch(reiniciar());
    const g = store.getState().game;
    expect(g.modo).toBe('sandbox');
    expect(g.capitalInicial).toBe(100000);
    expect(g.caixa).toBe(100000);
    expect(g.tela).toBe('jogo');
  });

  it('escolherCenario monta o sub-estado do cenário', () => {
    const store = makeStore();
    store.dispatch(escolherModo('cenarios'));
    expect(store.getState().game.aposentadoria).not.toBeNull(); // default
    store.dispatch(escolherCenario('imoveis'));
    const g = store.getState().game;
    expect(g.aposentadoria).toBeNull();
    expect(g.imoveis).not.toBeNull();
    expect(g.imoveis?.escolha).toBe('comprar');
  });

  it('voltarMenu volta pra intro preservando as escolhas do menu', () => {
    const store = makeStore();
    store.dispatch(escolherModo('sandbox'));
    store.dispatch(escolherCapital(100000));
    store.dispatch(comecar());
    store.dispatch(mover({ key: 'reserva', valor: 500 }));
    expect(store.getState().game.tela).toBe('jogo');

    store.dispatch(voltarMenu());
    const g = store.getState().game;
    expect(g.tela).toBe('intro');
    expect(g.modo).toBe('sandbox');
    expect(g.capitalInicial).toBe(100000);
    expect(g.ativos.reserva).toBe(0); // partida descartada
  });

  // Caracterização do pseudo-modo: `cenarios` é um MODO, e regras.js só monta o
  // cenário quando modo==='cenarios'. Hoje o Intro esconde a lista de cenários
  // fora desse modo, então ninguém tropeça — mas com a página CENÁRIOS dedicada
  // esse vira o caminho normal. A E4 inverte este teste.
  it('escolherCenario fora do modo cenarios descarta o cenário (comportamento atual)', () => {
    const store = makeStore();
    store.dispatch(escolherModo('sandbox'));
    store.dispatch(escolherCenario('imoveis'));
    const g = store.getState().game;
    expect(g.modo).toBe('sandbox');
    expect(g.cenario).toBeNull();
    expect(g.imoveis).toBeNull();
  });

  it('selectors formatam o view-model (porta do renderVals)', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(mover({ key: 'reserva', valor: 500 }));
    const ativos = selectAtivosLista(store.getState());
    const reserva = ativos.find((a) => a.key === 'reserva');
    expect(reserva?.valorFmt).toBe('R$ 500');
    expect(reserva?.varFmt).toBe('▲ +0.0% no mês'); // com saldo, mostra variação (0 antes do 1º mês)
    const cripto = ativos.find((a) => a.key === 'cripto');
    expect(cripto?.varFmt).toBe('—'); // zerado mostra o traço (regra v < 1 do renderVals)
    const painel = selectPainel(store.getState());
    expect(painel.caixaFmt).toBe('R$ 1.000');
    expect(painel.caixaCor).toBe('#ff4d5e'); // caixa < custo
    expect(painel.mesFmt).toBe('00');
    expect(painel.progLabel).toContain('RUMO À INDEPENDÊNCIA');
  });
});
