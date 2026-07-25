// Placar: nick do jogador + cache do board global (Supabase via engine/placar.js).
// O board local (fallback) é lido direto do engine nos selectors.
import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { config, formato, placar } from '../../engine';
import type { GameState, RegistroPlacar } from '../../engine/types';

export interface PlacarState {
  nick: string;
  lbRemoto: { board: string; lista: RegistroPlacar[] } | null;
  /** bump a cada gravação no board local (localStorage vive fora do Redux —
   *  sem isso o selector memoizado nunca recomputaria a lista local). */
  localVersao: number;
}

/** Busca o top 10 global do board; null quando offline/erro (local assume). */
export const carregarPlacar = createAsyncThunk('placar/carregar', async (board: string) => {
  const lista = await placar.lerRemoto(board);
  return lista ? { board, lista } : null;
});

const placarSlice = createSlice({
  name: 'placar',
  initialState: (): PlacarState => ({ nick: placar.nick(), lbRemoto: null, localVersao: 0 }),
  reducers: {
    setNick(state, action: PayloadAction<string>) {
      const v = action.payload.toUpperCase().slice(0, 16);
      placar.salvarNick(v);
      state.nick = v;
    },
    placarLocalMudou(state) {
      state.localVersao += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(carregarPlacar.fulfilled, (state, action) => {
      if (action.payload) state.lbRemoto = action.payload;
    });
  },
});

export const { setNick, placarLocalMudou } = placarSlice.actions;
export const placarReducer = placarSlice.reducer;

// ---- selectors (porta o bloco lbLista/lbTitulo do renderVals) ----

type ComPlacarEGame = { placar: PlacarState; game: GameState };

const { fmtCompacto, fmtTempo } = formato;

const LB_ROTULOS: Record<string, [string, string]> = {
  livre: ['LIVRE', '#22d47e'],
  marco: ['LIVRE', '#22d47e'],
  apos_sucesso: ['VIVEU', '#22d47e'],
  apos_faliu: ['ZEROU', '#ff4d5e'],
  imoveis_fim: ['FIM', '#4bb7ff'],
  faliu: ['FALIU', '#ff4d5e'],
};

export const selectNick = (s: ComPlacarEGame) => s.placar.nick;

const selectBoard = (s: ComPlacarEGame) => placar.boardDe(s.game);
const selectLbRemoto = (s: ComPlacarEGame) => s.placar.lbRemoto;
const selectLocalVersao = (s: ComPlacarEGame) => s.placar.localVersao;

export const selectLeaderboard = createSelector(
  [selectBoard, selectLbRemoto, selectNick, selectLocalVersao],
  (board, lbRemoto, nick, _localVersao) => {
    const remoto = lbRemoto && lbRemoto.board === board ? lbRemoto.lista : null;
    const linhas = (remoto ?? placar.ler(board)).map((p, i) => {
      const [rotulo, cor] = LB_ROTULOS[p.resultado] ?? [String(p.resultado || '?').toUpperCase(), '#8fa1b2'];
      const venceu = placar.vitoria(p.resultado);
      let det = p.meses + 'm';
      if (venceu && (board === 'aposentadoria' || board === 'imoveis')) det += ' · ' + fmtCompacto(p.pat || 0);
      else if (venceu) det += ' · ⏱' + fmtTempo((p.tempo || 0) * 1000);
      if (board === 'sandbox' && p.detalhe) det = fmtCompacto(Number(p.detalhe)) + ' → ' + det;
      if (board === 'imoveis' && p.detalhe) det = (p.detalhe === 'comprar' ? '🏠 ' : '📈 ') + det;
      if (p.dificuldade === 'hardcore') det += ' · HC';
      return {
        pos: '#' + (i + 1),
        nome: p.nome,
        status: rotulo,
        cor,
        detalhe: det,
        bg: p.voce || (nick && p.nome === nick) ? 'rgba(34,212,126,.08)' : 'transparent',
      };
    });
    if (!linhas.length) {
      linhas.push({
        pos: '—',
        nome: remoto ? 'seja o primeiro do mundo a pontuar aqui' : 'nenhuma partida registrada ainda',
        status: '', cor: '#3a4a5a', detalhe: '', bg: 'transparent',
      });
    }
    return {
      lbLista: linhas,
      lbTitulo: '▮ PLACAR ' + (remoto ? 'GLOBAL' : 'LOCAL') + ' · ' + nomeDoBoard(board),
      lbTituloCor: remoto ? '#22d47e' : '#6b7c8c',
    };
  }
);

function nomeDoBoard(board: string): string {
  const def = config.modos.find((m) => m.id === board) ?? config.cenarios.find((c) => c.id === board);
  return def ? def.nome : board.toUpperCase();
}
