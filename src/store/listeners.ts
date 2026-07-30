// Efeitos colaterais do jogo (listener middleware) — nada disso mora em reducer:
// 1. persistir conceitos vistos (mesma chave do protótipo DC);
// 2. registrar partida no placar (fim de jogo ou marco do sandbox) + envio global;
// 3. gatilhos educacionais que dependem do ESTADO, não de um clique
//    (porta o verificarConceitosDeEstado do orquestrador);
// 4. persistir as preferências de apresentação (tema, fonte, escala, contraste, visão);
// 5. persistir o nick do placar;
// 6. persistir o progresso da biblioteca;
// 7. desbloquear conteúdo pelo que o ESTADO diz que o jogador viveu;
// 8. aposentar o convite do tutorial quando ele efetivamente começa.
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ativos as ativosDef, conceitos, placar, regras } from '../engine';
import {
  abrirEstudo,
  dispensarConvite,
  marcarLido,
  salvarProgresso,
  viveu,
} from '../features/biblioteca';
import { abrirModal, marcarVisto } from '../features/conceitos/conceitosSlice';
import { comecar, fecharMes, mover, setAuto } from '../features/game/gameSlice';
import { carregarPlacar, placarLocalMudou, setNick } from '../features/placar/placarSlice';
import {
  salvarPrefs,
  setContraste,
  setEscala,
  setFonte,
  setTema,
  setVisao,
} from '../features/prefs';
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
    // Tutorial não pontua: seria um board onde todo mundo empata em 6 meses,
    // e a primeira partida de alguém não é lugar de ranking.
    if (depois.modo === 'tutorial') return;
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

// 4) Preferências de apresentação — mesma ideia do #1. O matcher lista as
//    ações uma a uma, então preferência nova exige entrar aqui também: sem
//    isso ela funciona na sessão e desaparece no reload.
startListening({
  matcher: isAnyOf(setTema, setFonte, setEscala, setContraste, setVisao),
  effect: (_action, api) => salvarPrefs(api.getState().prefs),
});

// 6) Progresso da biblioteca (o que foi vivido, o que foi lido, o convite do
//    tutorial). Mesmo padrão do #1 e do #4 — e a mesma armadilha: ação nova
//    que mexa no progresso precisa entrar neste matcher.
startListening({
  matcher: isAnyOf(viveu, marcarLido, abrirEstudo, dispensarConvite),
  effect: (_action, api) => salvarProgresso(api.getState().biblioteca),
});

// 7) Desbloqueio POR EXPERIÊNCIA. A biblioteca cresce como registro do que o
//    jogador viveu, não do que ele navegou — então quem decide é o ESTADO
//    depois do mês, comparado com o de antes.
//
//    Só entram aqui os gatilhos SEM tooltip: onde existe modal educacional
//    (aporte em ações, diversificação, liquidação forçada…), quem registra é
//    o marcarVisto do conceitosSlice — dois caminhos pro mesmo id dariam
//    hint e modal na mesma cena.
startListening({
  actionCreator: fecharMes,
  effect: (_action, api) => {
    const antes = api.getOriginalState().game;
    const s = api.getState().game;
    const registrar = (id: string) => api.dispatch(viveu(id));

    if ((s.pendente ?? 0) > 0) registrar('despesaInesperada');
    if (s.caixa < 0 && antes.caixa >= 0) registrar('saldoNegativo');
    if (s.salario > 0 && s.custo > s.salario && antes.custo <= antes.salario) {
      registrar('inflacaoComeSalario');
    }
    if (s.fim && !antes.fim) {
      if (s.fim === 'faliu') registrar('falencia');
      if (s.fim === 'apos_faliu') registrar('aposentadoriaEsgotada');
    }
  },
});

// 8) Começar o tutorial aposenta o convite. Vale pelos dois caminhos — o [T]
//    da home e o cartão em MODOS — porque quem observa é o `comecar`, não o
//    botão. Sem isto, terminar o tutorial sem disparar nenhum gatilho deixaria
//    a home convidando de novo pro que a pessoa acabou de fazer.
startListening({
  actionCreator: comecar,
  effect: (_action, api) => {
    const { game, biblioteca } = api.getState();
    if (game.modo === 'tutorial' && !biblioteca.conviteDispensado) {
      api.dispatch(dispensarConvite());
    }
  },
});

// 5) Nick do placar: persiste pela mesma chave que o engine já usa.
startListening({
  actionCreator: setNick,
  effect: (_action, api) => placar.salvarNick(api.getState().placar.nick),
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
