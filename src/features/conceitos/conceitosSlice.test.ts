import { beforeEach, describe, expect, it } from 'vitest';
import { makeStore } from '../../store';
import { conceitos } from '../../engine';
// O contador e a lista do glossário mudaram de casa: quem os monta agora é o
// bibliotecaSlice, que conhece a UNIÃO dos dois registros de gatilho (os com
// tooltip, aqui, e os sem tooltip, lá). Este teste continua sendo sobre a
// REGRA de desbloqueio do engine — só lê o resultado pelo dono novo.
import { selectContadorLongo, selectGlossarioLista } from '../biblioteca';
import { marcarVisto, selectJaVisto, selectTermosDesbloqueados } from './conceitosSlice';

// O glossário cresce a cada conceito novo (o realista trouxe nove): o que o
// teste afirma é a REGRA de desbloqueio, não o tamanho do dicionário.
const TOTAL = Object.keys(conceitos.termos).length;

describe('conceitosSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('começa só com a curiosidade aberta quando não há progresso salvo', () => {
    const store = makeStore();
    // `peculium` tem `sempre: true` no engine — é o nome do jogo, nasce aberto
    expect(selectTermosDesbloqueados(store.getState())).toEqual(['peculium']);
    expect(selectContadorLongo(store.getState())).toBe(`1/${TOTAL} termos desbloqueados`);
    const lista = selectGlossarioLista(store.getState());
    expect(lista.abertos.map((t) => t.id)).toEqual(['peculium']);
    expect(lista.trancados).toBe(TOTAL - 1);
  });

  it('marcarVisto desbloqueia os termos do tooltip via regra do engine', () => {
    const store = makeStore();
    store.dispatch(marcarVisto('acoes')); // tooltip acoes → termo volatilidade
    expect(selectTermosDesbloqueados(store.getState())).toContain('volatilidade');
    expect(selectContadorLongo(store.getState())).toBe(`2/${TOTAL} termos desbloqueados`);
    expect(selectJaVisto('acoes')(store.getState())).toBe(true);
    const linha = selectGlossarioLista(store.getState()).abertos.find((t) => t.id === 'volatilidade');
    expect(linha?.nome).toBe('Volatilidade');
  });

  it('é idempotente e persiste na MESMA chave do protótipo', () => {
    const store = makeStore();
    store.dispatch(marcarVisto('reserva'));
    store.dispatch(marcarVisto('reserva'));
    expect(store.getState().conceitos.vistos).toEqual(['reserva']);
    // formato idêntico ao que engine/conceitos.js grava — protótipo lê direto
    expect(localStorage.getItem(conceitos.CHAVE)).toBe(JSON.stringify(['reserva']));
    // tooltip reserva cita cdi + selic → 2 termos, + a curiosidade peculium
    expect(selectContadorLongo(store.getState())).toBe(`3/${TOTAL} termos desbloqueados`);
  });

  it('inicializa a partir do progresso já salvo pelo protótipo', () => {
    localStorage.setItem(conceitos.CHAVE, JSON.stringify(['sequencia']));
    const store = makeStore();
    expect(selectTermosDesbloqueados(store.getState())).toContain('sequenciaRetornos');
    expect(selectContadorLongo(store.getState())).toBe(`2/${TOTAL} termos desbloqueados`);
  });
});
