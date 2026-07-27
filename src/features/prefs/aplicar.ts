// As preferências viram atributos no <html>; quem resolve as cores/fontes é o
// tema.css. Uma escrita por preferência, em vez de 38 setProperty.
import type { PrefsState } from './tipos';

/** Idempotente — pode rodar antes do render e a cada mudança (StrictMode ok). */
export function aplicarPrefs(p: PrefsState): void {
  const el = document.documentElement;
  el.dataset.tema = p.tema;
  el.dataset.fonte = p.fonte;
  el.dataset.escala = p.escala;
}
