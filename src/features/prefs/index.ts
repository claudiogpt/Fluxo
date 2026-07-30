export { aplicarPrefs } from './aplicar';
export { CHAVE_PREFS, lerPrefs, salvarPrefs } from './armazenamento';
export {
  prefsReducer,
  selectPrefs,
  setContraste,
  setEscala,
  setFonte,
  setTema,
  setVisao,
} from './prefsSlice';
export {
  CONTRASTES,
  ESCALAS,
  FONTES,
  PREFS_PADRAO,
  TEMAS,
  VISOES,
  type ContrasteId,
  type EscalaId,
  type FonteFamiliaId,
  type PrefsState,
  type TemaId,
  type VisaoId,
} from './tipos';
