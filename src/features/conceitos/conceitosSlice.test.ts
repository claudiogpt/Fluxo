import { beforeEach, describe, expect, it } from 'vitest';
import { makeStore } from '../../store';
import { conceitos } from '../../engine';
import {
  marcarVisto,
  selectContador,
  selectGlossarioLista,
  selectJaVisto,
  selectTermosDesbloqueados,
} from './conceitosSlice';

describe('conceitosSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('começa vazio quando não há progresso salvo', () => {
    const store = makeStore();
    expect(selectTermosDesbloqueados(store.getState())).toEqual([]);
    expect(selectContador(store.getState())).toBe('0/8 termos desbloqueados');
    expect(selectGlossarioLista(store.getState()).every((t) => t.nome === '???')).toBe(true);
  });

  it('marcarVisto desbloqueia os termos do tooltip via regra do engine', () => {
    const store = makeStore();
    store.dispatch(marcarVisto('acoes')); // tooltip acoes → termo volatilidade
    expect(selectTermosDesbloqueados(store.getState())).toContain('volatilidade');
    expect(selectContador(store.getState())).toBe('1/8 termos desbloqueados');
    expect(selectJaVisto('acoes')(store.getState())).toBe(true);
    const linha = selectGlossarioLista(store.getState()).find((t) => t.id === 'volatilidade');
    expect(linha?.nome).toBe('Volatilidade');
    expect(linha?.icone).toBe('📖');
  });

  it('é idempotente e persiste na MESMA chave do protótipo', () => {
    const store = makeStore();
    store.dispatch(marcarVisto('reserva'));
    store.dispatch(marcarVisto('reserva'));
    expect(store.getState().conceitos.vistos).toEqual(['reserva']);
    // formato idêntico ao que engine/conceitos.js grava — protótipo lê direto
    expect(localStorage.getItem(conceitos.CHAVE)).toBe(JSON.stringify(['reserva']));
    // tooltip reserva cita cdi + selic → 2 termos
    expect(selectContador(store.getState())).toBe('2/8 termos desbloqueados');
  });

  it('inicializa a partir do progresso já salvo pelo protótipo', () => {
    localStorage.setItem(conceitos.CHAVE, JSON.stringify(['sequencia']));
    const store = makeStore();
    expect(selectTermosDesbloqueados(store.getState())).toContain('sequenciaRetornos');
    expect(selectContador(store.getState())).toBe('1/8 termos desbloqueados');
  });
});
