// Tipos e padrão num módulo só-dados: o slice precisa do armazenamento (pra
// ler o estado inicial) e o armazenamento precisa do padrão — sem este arquivo
// no meio, os dois se importam em ciclo e o initialState sai undefined.
export type TemaId = 'escuro' | 'claro';
export type FonteFamiliaId = 'mono' | 'sans';
export type EscalaId = 'compacto' | 'normal' | 'grande';

export interface PrefsState {
  tema: TemaId;
  fonte: FonteFamiliaId;
  escala: EscalaId;
}

export const PREFS_PADRAO: PrefsState = { tema: 'escuro', fonte: 'mono', escala: 'normal' };

export const TEMAS: readonly TemaId[] = ['escuro', 'claro'];
export const FONTES: readonly FonteFamiliaId[] = ['mono', 'sans'];
export const ESCALAS: readonly EscalaId[] = ['compacto', 'normal', 'grande'];
