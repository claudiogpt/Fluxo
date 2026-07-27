// Mantém o <html> em dia com as preferências do store. A primeira aplicação
// acontece no main.tsx, antes do render, pra não haver flash do tema errado.
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { aplicarPrefs, selectPrefs, type PrefsState } from '../features/prefs';

export function usePrefs(): PrefsState {
  const prefs = useSelector(selectPrefs);
  useEffect(() => aplicarPrefs(prefs), [prefs]);
  return prefs;
}
