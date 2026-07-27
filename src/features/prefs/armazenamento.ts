// Leitura/escrita das preferências. Validação por lista branca, campo a campo:
// um spread cego do JSON deixaria um {"tema":"roxo"} sobrevivente no storage
// quebrar o CSS em silêncio (nenhuma regra casa, o tema some).
import { ESCALAS, FONTES, PREFS_PADRAO, TEMAS, type PrefsState } from './tipos';

export const CHAVE_PREFS = 'fluxo_prefs_v1'; // convenção fluxo_*_vN do projeto

const valido = <T extends string>(permitidos: readonly T[], v: unknown, padrao: T): T =>
  permitidos.includes(v as T) ? (v as T) : padrao;

export function lerPrefs(): PrefsState {
  try {
    const cru: unknown = JSON.parse(localStorage.getItem(CHAVE_PREFS) || '{}');
    const o = (typeof cru === 'object' && cru !== null ? cru : {}) as Record<string, unknown>;
    return {
      tema: valido(TEMAS, o.tema, PREFS_PADRAO.tema),
      fonte: valido(FONTES, o.fonte, PREFS_PADRAO.fonte),
      escala: valido(ESCALAS, o.escala, PREFS_PADRAO.escala),
    };
  } catch {
    return { ...PREFS_PADRAO }; // JSON corrompido ou sem storage
  }
}

export function salvarPrefs(p: PrefsState): void {
  try {
    localStorage.setItem(CHAVE_PREFS, JSON.stringify(p));
  } catch {
    /* sem storage: só não persiste */
  }
}
