export { aplicarPrefs } from './aplicar';
export { CHAVE_PREFS, lerPrefs, salvarPrefs } from './armazenamento';
export { prefsReducer, selectPrefs, setEscala, setFonte, setTema } from './prefsSlice';
export {
  ESCALAS,
  FONTES,
  PREFS_PADRAO,
  TEMAS,
  type EscalaId,
  type FonteFamiliaId,
  type PrefsState,
  type TemaId,
} from './tipos';
