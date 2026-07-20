// Store central do conteúdo educacional (tooltips + glossário).
//
// Fonte única, sem duplicação: os TEXTOS (termos e tooltips) permanecem em
// engine/conceitos.js, e a REGRA de desbloqueio ("termo destrava quando um
// tooltip que o cita é visto") também — os selectors chamam o engine passando
// um storage adapter em memória sobre o estado do slice. Aqui só mora a
// reatividade (Redux) e a lista de ids vistos.
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { conceitos } from '../../engine';
import type { StorageLike } from '../../engine/types';

export interface ConceitosState {
  /** ids de tooltips já vistos (mesmo formato do protótipo em fluxo_conceitos_v1) */
  vistos: string[];
}

/** Adapter que apresenta o estado do slice pro engine como se fosse um storage. */
const comoStorage = (vistos: string[]): StorageLike => ({
  getItem: () => JSON.stringify(vistos),
});

const conceitosSlice = createSlice({
  name: 'conceitos',
  // Lazy: lê o localStorage (mesma chave do protótipo) na criação do store.
  initialState: (): ConceitosState => ({ vistos: conceitos.vistos() }),
  reducers: {
    marcarVisto(state, action: PayloadAction<string>) {
      if (!state.vistos.includes(action.payload)) state.vistos.push(action.payload);
    },
  },
});

export const { marcarVisto } = conceitosSlice.actions;
export const conceitosReducer = conceitosSlice.reducer;

// ---- selectors ----
// Tipados contra a fatia (não o RootState) pra evitar import circular com o store.
type ComConceitos = { conceitos: ConceitosState };

export const selectVistos = (s: ComConceitos) => s.conceitos.vistos;

export const selectJaVisto = (id: string) => (s: ComConceitos) =>
  conceitos.jaVisto(id, comoStorage(s.conceitos.vistos));

export const selectTermosDesbloqueados = createSelector([selectVistos], (vistos) =>
  conceitos.termosDesbloqueados(comoStorage(vistos))
);

/** Linhas prontas pro Glossário — espelha o view-model do orquestrador DC. */
export const selectGlossarioLista = createSelector([selectTermosDesbloqueados], (desbloqueados) =>
  Object.keys(conceitos.termos).map((id) => {
    const termo = conceitos.termos[id];
    const desb = desbloqueados.includes(id);
    return {
      id,
      desbloqueado: desb,
      icone: desb ? '📖' : '🔒',
      nome: desb ? termo.nome : '???',
      definicao: desb
        ? termo.definicao
        : 'Continue jogando: este conceito aparece quando a decisão certa (ou errada) acontecer.',
    };
  })
);

export const selectContador = createSelector([selectTermosDesbloqueados], (desbloqueados) =>
  `${desbloqueados.length}/${Object.keys(conceitos.termos).length} termos desbloqueados`
);
