import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { conceitos } from '../engine';
import { conceitosReducer, marcarVisto } from '../features/conceitos/conceitosSlice';

// Persistência: a cada marcarVisto, grava a lista na MESMA chave do protótipo
// (fluxo_conceitos_v1) — progresso compartilhado entre os dois apps enquanto
// a migração corre. Efeito colateral mora aqui, nunca no reducer.
const listener = createListenerMiddleware();
listener.startListening({
  actionCreator: marcarVisto,
  effect: (_action, api) => {
    const { vistos } = (api.getState() as RootState).conceitos;
    try {
      localStorage.setItem(conceitos.CHAVE, JSON.stringify(vistos));
    } catch {
      /* sem storage (SSR/teste sem jsdom): só não persiste */
    }
  },
});

/** Fábrica de store — usada pelo app e pelos testes (cada teste cria o seu). */
export function makeStore() {
  return configureStore({
    reducer: {
      conceitos: conceitosReducer,
    },
    middleware: (getDefault) => getDefault().prepend(listener.middleware),
  });
}

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
