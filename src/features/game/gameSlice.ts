// Estado do jogo no RTK. Regra de ouro: o ENGINE é dono de toda transição —
// os reducers só embrulham (clone → chama engine → merge). Nenhuma regra de
// negócio aqui, exatamente como o orquestrador DC fazia com setState.
//
// Semântica mista do engine (herdada do setState do DC):
// - regras.fecharMes(s) MUTA a cópia e retorna o estado completo;
// - mover/aportarNegocio/sacarNegocio/reinvestirNegocio retornam PARCIAIS
//   pra merge ({} = no-op).
import { createSlice, current, type PayloadAction } from '@reduxjs/toolkit';
import { regras } from '../../engine';
import type { AtivoKey, Dificuldade, GameState, NovoJogoProps } from '../../engine/types';

const PROPS_PADRAO: NovoJogoProps = { dificuldade: 'hardcore', salarioInicial: 4500 };

/** clone → engine → merge (o engine pode mutar a cópia e/ou retornar parcial). */
function aplicar(
  state: GameState,
  chamada: (s: GameState) => Partial<GameState> | GameState
): GameState {
  const copia = structuredClone(current(state)) as GameState;
  const resultado = chamada(copia);
  return resultado === copia ? copia : { ...copia, ...resultado };
}

/** Porta o novoEstado do orquestrador: recria o jogo preservando as escolhas
 *  do menu (dificuldade, modo, capital, cenário, saque, estratégia). */
function recriar(state: GameState, mudanca: Partial<NovoJogoProps>): GameState {
  const s = current(state) as GameState;
  const escolhas: NovoJogoProps = {
    ...PROPS_PADRAO,
    dificuldade: s.dificuldade,
    modo: s.modo,
    capitalInicial: s.capitalInicial,
    cenario: s.cenario ?? undefined,
    saqueModo: s.aposentadoria?.saqueModo,
    imoveisEscolha: s.imoveis?.escolha,
    ...mudanca,
  };
  // capital custom só faz sentido no sandbox (mesma regra do orquestrador)
  if (escolhas.modo !== 'sandbox') escolhas.capitalInicial = null;
  return regras.novoJogo(escolhas);
}

const gameSlice = createSlice({
  name: 'game',
  initialState: (): GameState => regras.novoJogo(PROPS_PADRAO),
  reducers: {
    // ---- fluxo de partida ----
    comecar(state) {
      state.tela = 'jogo';
      state.inicioTs = Date.now();
      state.agora = Date.now();
    },
    fecharMes(state, action: PayloadAction<{ rng?: () => number } | undefined>) {
      if (state.fim) return; // partida encerrada: nada mais a fechar
      return aplicar(state, (s) => regras.fecharMes(s, action.payload));
    },
    mover(state, action: PayloadAction<{ key: AtivoKey; valor: number }>) {
      return aplicar(state, (s) => regras.mover(s, action.payload.key, action.payload.valor));
    },
    aportarNegocio(state, action: PayloadAction<number>) {
      return aplicar(state, (s) => regras.aportarNegocio(s, action.payload));
    },
    sacarNegocio(state, action: PayloadAction<number>) {
      return aplicar(state, (s) => regras.sacarNegocio(s, action.payload));
    },
    reinvestirNegocio(state) {
      return aplicar(state, (s) => regras.reinvestirNegocio(s));
    },
    tick(state, action: PayloadAction<number>) {
      state.agora = action.payload;
    },
    toggleAuto(state) {
      state.auto = !state.auto;
    },
    setAuto(state, action: PayloadAction<boolean>) {
      state.auto = action.payload;
    },
    // ---- menu (recriam o estado preservando escolhas) ----
    reiniciar(state) {
      const novo = recriar(state, {});
      return { ...novo, tela: 'jogo', inicioTs: Date.now(), agora: Date.now() };
    },
    voltarMenu(state) {
      // tela explícita: sem isso, voltar pro menu depende de novoJogo devolver
      // tela:'intro' — um default do engine que ninguém garante pra sempre.
      return { ...recriar(state, {}), tela: 'intro' as const };
    },
    escolherDificuldade(state, action: PayloadAction<Dificuldade>) {
      return recriar(state, { dificuldade: action.payload });
    },
    escolherModo(state, action: PayloadAction<string>) {
      return recriar(state, { modo: action.payload });
    },
    escolherCapital(state, action: PayloadAction<number>) {
      return recriar(state, { capitalInicial: action.payload });
    },
    escolherCenario(state, action: PayloadAction<string>) {
      // 'cenarios' é um MODO no engine (regras.js só monta o cenário quando
      // modo==='cenarios'), então escolher um cenário implica entrar no modo —
      // senão a escolha era descartada em silêncio e caía no clássico.
      return recriar(state, { modo: 'cenarios', cenario: action.payload });
    },
    escolherSaqueModo(state, action: PayloadAction<'fixo' | 'percentual'>) {
      return recriar(state, { saqueModo: action.payload });
    },
    escolherEstrategia(state, action: PayloadAction<'comprar' | 'alugar'>) {
      return recriar(state, { imoveisEscolha: action.payload });
    },
  },
});

export const {
  comecar,
  fecharMes,
  mover,
  aportarNegocio,
  sacarNegocio,
  reinvestirNegocio,
  tick,
  toggleAuto,
  setAuto,
  reiniciar,
  voltarMenu,
  escolherDificuldade,
  escolherModo,
  escolherCapital,
  escolherCenario,
  escolherSaqueModo,
  escolherEstrategia,
} = gameSlice.actions;

export const gameReducer = gameSlice.reducer;
