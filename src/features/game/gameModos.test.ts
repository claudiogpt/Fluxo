// Integração por modo: valida a FIAÇÃO store→selectors de cada modo/cenário
// (as regras em si já têm os 68 testes do engine).
import { beforeEach, describe, expect, it } from 'vitest';
import { makeStore } from '../../store';
import {
  aportarNegocio,
  comecar,
  escolherCenario,
  escolherEstrategia,
  escolherModo,
  fecharMes,
  mover,
  reinvestirNegocio,
  sacarNegocio,
} from './gameSlice';
import { selectImovelCard, selectIntroConfig, selectNegocioCard, selectPainel } from './selectors';

// 10 draws neutros (5 ativos ×2) + 0.99 no sorteio de evento (não sorteia).
// Modos com draws extras (empresário: variância da receita; imóveis:
// valorização) usam a versão de 12 — o 0.99 precisa cair no sorteio do evento.
const rngNeutro10 = () => {
  const vals = [...Array(10).fill(0.5), 0.99];
  let i = 0;
  return () => (i < vals.length ? vals[i++] : vals[vals.length - 1]);
};
const rngNeutro = () => {
  const vals = [...Array(12).fill(0.5), 0.99];
  let i = 0;
  return () => (i < vals.length ? vals[i++] : vals[vals.length - 1]);
};

describe('modos no store', () => {
  beforeEach(() => localStorage.clear());

  it('empresário: card ativo, reinvestir/sacar/aportar fiados ao engine', () => {
    const store = makeStore();
    store.dispatch(escolherModo('empresario'));
    store.dispatch(comecar());
    const card0 = selectNegocioCard(store.getState());
    expect(card0?.statusLabel).toBe('OPERANDO');
    expect(card0?.caixaFmt).toBe('R$ 4.000');
    expect(selectPainel(store.getState()).salarioLabel).toBe('LUCRO MÉDIO DO NEGÓCIO');

    store.dispatch(reinvestirNegocio());
    expect(selectNegocioCard(store.getState())?.caixaFmt).toBe('R$ 3.000');
    store.dispatch(sacarNegocio(1000));
    expect(store.getState().game.caixa).toBe(1500 + 1000); // PF hardcore começa com 1500
    store.dispatch(aportarNegocio(500));
    expect(selectNegocioCard(store.getState())?.caixaFmt).toBe('R$ 2.500');
  });

  it('aposentadoria: acumulação → saque → desfecho, com badge de fase', () => {
    const store = makeStore();
    store.dispatch(escolherModo('cenarios')); // default: aposentadoria
    store.dispatch(comecar());
    expect(selectPainel(store.getState()).modoTag).toContain('ACUMULAÇÃO');
    // corre a acumulação inteira + saques até o fim (fixo; sem aportes = zera rápido)
    for (let i = 0; i < 120 && !store.getState().game.fim; i++) {
      store.dispatch(fecharMes({ rng: rngNeutro() }));
    }
    const g = store.getState().game;
    expect(['apos_sucesso', 'apos_faliu', 'faliu']).toContain(g.fim);
  });

  it('imóveis: corrida tijolo vs fantasma no card, estratégia alternável', () => {
    const store = makeStore();
    store.dispatch(escolherModo('cenarios'));
    store.dispatch(escolherCenario('imoveis'));
    expect(selectIntroConfig(store.getState()).mostraEstrategia).toBe(true);
    store.dispatch(escolherEstrategia('alugar'));
    expect(store.getState().game.imoveis?.escolha).toBe('alugar');
    store.dispatch(escolherEstrategia('comprar'));
    store.dispatch(comecar());
    store.dispatch(fecharMes({ rng: rngNeutro() }));
    const card = selectImovelCard(store.getState());
    expect(card?.escolhaLabel).toContain('COMPRANDO 1/');
    expect(card?.tijoloTag).toBe('TIJOLO (VOCÊ)');
    expect(card?.carteiraTag).toContain('FANTASMA');
    expect(selectPainel(store.getState()).modoTag).toBe('IMÓVEIS · COMPRANDO');
  });

  it('sandbox: marco da liberdade registra no placar sem encerrar o jogo', () => {
    const store = makeStore();
    store.dispatch(escolherModo('sandbox'));
    store.dispatch(comecar());
    // injeta patrimônio suficiente comprando FIIs mês a mês até o marco
    for (let i = 0; i < 300 && !store.getState().game.marcoLivre; i++) {
      const caixa = store.getState().game.caixa;
      if (caixa > 0) store.dispatch(mover({ key: 'fiis', valor: caixa }));
      store.dispatch(fecharMes({ rng: rngNeutro10() }));
    }
    const g = store.getState().game;
    expect(g.marcoLivre).toBe(true);
    expect(g.fim).toBeNull(); // sandbox nunca termina
    const locais = JSON.parse(localStorage.getItem('fluxo_placar_v2') || '[]');
    expect(locais.length).toBe(1);
    expect(locais[0].modo).toBe('sandbox');
    expect(locais[0].resultado).toBe('marco');
  });
});
