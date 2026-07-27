import { configureStore } from '@reduxjs/toolkit';
import { conceitosReducer } from '../features/conceitos/conceitosSlice';
import { gameReducer } from '../features/game/gameSlice';
import { placarReducer } from '../features/placar/placarSlice';
import { prefsReducer } from '../features/prefs';
import { listener } from './listeners';

/** Fábrica de store — usada pelo app e pelos testes (cada teste cria o seu). */
export function makeStore() {
  return configureStore({
    reducer: {
      conceitos: conceitosReducer,
      game: gameReducer,
      placar: placarReducer,
      prefs: prefsReducer,
    },
    middleware: (getDefault) =>
      getDefault({
        // fecharMes aceita { rng } injetável (função) — só em testes; ignorado aqui.
        serializableCheck: { ignoredActionPaths: ['payload.rng'] },
      }).prepend(listener.middleware),
  });
}

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
