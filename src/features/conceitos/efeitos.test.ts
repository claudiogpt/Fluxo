import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeStore } from '../../store';
import { placar } from '../../engine';
import { comecar, fecharMes, mover } from '../game/gameSlice';
import { aportarPctComConceito, confirmarModal } from './thunks';

function rngNeutro() {
  const vals = [...Array(10).fill(0.5), 0.99];
  let i = 0;
  return () => (i < vals.length ? vals[i++] : vals[vals.length - 1]);
}

describe('efeitos educacionais e placar', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('1º aporte em ações abre o modal com a ação pendente; confirmar aplica', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(aportarPctComConceito('acoes', 20));
    // interceptado: modal aberto, dinheiro parado
    expect(store.getState().conceitos.modal?.id).toBe('acoes');
    expect(store.getState().game.caixa).toBe(1500);
    expect(store.getState().game.auto).toBe(false);
    // confirmar = marca visto + aplica a pendente + fecha
    store.dispatch(confirmarModal());
    expect(store.getState().conceitos.modal).toBeNull();
    expect(store.getState().conceitos.vistos).toContain('acoes');
    expect(store.getState().game.ativos.acoes).toBe(300); // 20% de 1.500
    // 2ª vez: direto, sem modal — e sobre a base nova (20% de 1.200)
    store.dispatch(aportarPctComConceito('acoes', 20));
    expect(store.getState().conceitos.modal).toBeNull();
    expect(store.getState().game.ativos.acoes).toBe(540);
  });

  it('3 classes na carteira disparam o conceito de diversificação (gatilho de estado)', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(mover({ key: 'reserva', valor: 500 }));
    store.dispatch(mover({ key: 'rendafixa', valor: 500 }));
    expect(store.getState().conceitos.modal).toBeNull(); // 2 classes: nada
    store.dispatch(mover({ key: 'fiis', valor: 400 }));
    expect(store.getState().conceitos.modal?.id).toBe('diversificacao');
    expect(store.getState().conceitos.modal?.acaoPendente).toBeUndefined(); // informativo
  });

  it('fim de partida registra no placar local e envia pro global', async () => {
    const enviar = vi.spyOn(placar, 'enviarRemoto').mockResolvedValue(false);
    const store = makeStore();
    store.dispatch(comecar());
    // estratégia tudo-em-FIIs até a renda passiva cruzar o custo (LIVRE)
    for (let i = 0; i < 300 && !store.getState().game.fim; i++) {
      const caixa = store.getState().game.caixa;
      if (caixa > 0) store.dispatch(mover({ key: 'fiis', valor: caixa }));
      store.dispatch(fecharMes({ rng: rngNeutro() }));
    }
    expect(store.getState().game.fim).toBe('livre');
    // aguarda o efeito assíncrono do listener
    await vi.waitFor(() => expect(enviar).toHaveBeenCalledOnce());
    const rec = enviar.mock.calls[0][0];
    expect(rec.modo).toBe('classico');
    expect(rec.resultado).toBe('livre');
    expect(rec.nome).toBe('ANÔNIMO');
    // salvo no board local (mesma chave v2 do jogo DC)
    const locais = placar.ler('classico');
    expect(locais.length).toBe(1);
    expect(locais[0].resultado).toBe('livre');
  });
});
