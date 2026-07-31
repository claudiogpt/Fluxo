// Tipos e padrão num módulo só-dados: o slice precisa do armazenamento (pra
// ler o estado inicial) e o armazenamento precisa do padrão — sem este arquivo
// no meio, os dois se importam em ciclo e o initialState sai undefined.
export type TemaId = 'escuro' | 'claro';
export type FonteFamiliaId = 'mono' | 'sans';
export type EscalaId = 'compacto' | 'normal' | 'grande';
// Ortogonais ao tema: contraste é intensidade, visão é matiz. Dois eixos e não
// um enum de "modo" porque eles se combinam — daltônico COM alto contraste é
// um pedido legítimo, e um enum único tornaria essa combinação inexprimível.
export type ContrasteId = 'normal' | 'alto';
export type VisaoId = 'padrao' | 'daltonico';

export interface PrefsState {
  tema: TemaId;
  fonte: FonteFamiliaId;
  escala: EscalaId;
  contraste: ContrasteId;
  visao: VisaoId;
}

export const PREFS_PADRAO: PrefsState = {
  tema: 'escuro',
  fonte: 'mono',
  escala: 'normal',
  contraste: 'normal',
  visao: 'padrao',
};

export const TEMAS: readonly TemaId[] = ['escuro', 'claro'];
export const FONTES: readonly FonteFamiliaId[] = ['mono', 'sans'];
export const ESCALAS: readonly EscalaId[] = ['compacto', 'normal', 'grande'];
export const CONTRASTES: readonly ContrasteId[] = ['normal', 'alto'];
export const VISOES: readonly VisaoId[] = ['padrao', 'daltonico'];
