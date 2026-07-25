// Efeitos colaterais do jogo (listener middleware) — nada disso mora em reducer:
// 1. persistir conceitos vistos (mesma chave do protótipo DC);
// 2. registrar partida no placar (fim de jogo ou marco do sandbox) + envio global;
// 3. gatilhos educacionais que dependem do ESTADO, não de um clique
//    (porta o verificarConceitosDeEstado do orquestrador).
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ativos as ativosDef, conceitos, placar, regras } from '../engine';
import { abrirModal, marcarVisto } from '../features/conceitos/conceitosSlice';
import { fecharMes, mover, setAuto } from '../features/game/gameSlice';
import { carregarPlacar, placarLocalMudou } from '../features/placar/placarSlice';
import type { AppDispatch, RootState } from './index';

export const listener = createListenerMiddleware();
const startListening = listener.startListening.withTypes<RootState, AppDispatch>();

// 1) Persistência dos conceitos vistos (progresso compartilhado com o protótipo).
startListening({
  actionCreator: marcarVisto,
  effect: (_action, api) => {
    try {
      localStorage.setItem(conceitos.CHAVE, JSON.stringify(api.getState().conceitos.vistos));
    } catch {
      /* sem storage: só não persiste */
    }
  },
});

// 2) Toda partida pontua: fim de jogo (qualquer modo) ou marco do sandbox.
//    Salva local, envia pro global (fire-and-forget) e recarrega o board.
startListening({
  actionCreator: fecharMes,
  effect: async (_action, api) => {
    const antes = api.getOriginalState().game;
    const depois = api.getState().game;
    const terminou = depois.fim && !antes.fim;
    const cruzouMarco = depois.marcoLivre && !antes.marcoLivre;
    if (!terminou && !cruzouMarco) return;
    const rec = placar.registro(
      depois,
      regras.patrimonio(depois),
      api.getState().placar.nick || 'ANÔNIMO',
      terminou ? undefined : 'marco'
    );
    placar.salvar(rec);
    api.dispatch(placarLocalMudou()); // board local vive no localStorage — avisa a UI
    const ok = await placar.enviarRemoto(rec);
    if (ok) api.dispatch(carregarPlacar(placar.boardDe(depois)));
  },
});

// 3) Conceitos disparados por estado: 1 modal por vez; condições persistentes
//    disparam no turno seguinte se houver fila (mesma semântica do DC).
startListening({
  matcher: isAnyOf(fecharMes, mover),
  effect: (_action, api) => {
    const { game, conceitos: c } = api.getState();
    if (c.modal || game.fim || game.tela !== 'jogo') return;
    const jaVisto = (id: string) => c.vistos.includes(id);
    const abrir = (id: string) => {
      api.dispatch(setAuto(false));
      api.dispatch(abrirModal({ id }));
    };
    const nClasses = ativosDef.filter((d) => game.ativos[d.key] >= 1).length;
    if (nClasses >= 3 && !jaVisto('diversificacao')) return abrir('diversificacao');
    if (game.aposentadoria?.fase === 'saque' && !jaVisto('sequencia')) return abrir('sequencia');
    if (game.liquidacaoNoMes && !jaVisto('liquidacaoForcada')) return abrir('liquidacaoForcada');
  },
});
