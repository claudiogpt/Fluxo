// Preferências de apresentação (tema, fonte). Slice separado do uiSlice de
// propósito: navegação é efêmera e se reseta a cada volta ao menu, preferência
// é persistente e nunca — misturar as duas convida um reset a apagar o tema.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { lerPrefs } from './armazenamento';
import type { EscalaId, FonteFamiliaId, PrefsState, TemaId } from './tipos';

const prefsSlice = createSlice({
  name: 'prefs',
  initialState: (): PrefsState => lerPrefs(), // lazy: lê o storage ao criar o store
  reducers: {
    setTema(state, action: PayloadAction<TemaId>) {
      state.tema = action.payload;
    },
    setFonte(state, action: PayloadAction<FonteFamiliaId>) {
      state.fonte = action.payload;
    },
    setEscala(state, action: PayloadAction<EscalaId>) {
      state.escala = action.payload;
    },
  },
});

export const { setTema, setFonte, setEscala } = prefsSlice.actions;
export const prefsReducer = prefsSlice.reducer;

type ComPrefs = { prefs: PrefsState };
export const selectPrefs = (s: ComPrefs) => s.prefs;
