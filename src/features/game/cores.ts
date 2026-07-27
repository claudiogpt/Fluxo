// O engine emite cor: `ativos.js` traz um `riscoCor` por ativo e o `addLog`
// de `regras.js`/`eventos.js` grava o hex DENTRO do estado (`s.log[].cor`).
// Como `engine/*.js` é intocável, a tradução hex → token vive aqui, na UI.
//
// Este é o único arquivo do `src/` autorizado a conter cor literal — e as
// literais aqui são chaves de busca, não valores de estilo.

export const MAPA_COR_ENGINE: Readonly<Record<string, string>> = {
  '#22d47e': 'var(--sucesso)',
  '#8fd47e': 'var(--sucesso-suave)',
  '#ffc24b': 'var(--aviso)',
  '#ff9d4b': 'var(--alerta)',
  '#ff4d5e': 'var(--perigo)',
  '#8fa1b2': 'var(--texto-fraco)',
  '#6b7c8c': 'var(--texto-rotulo)',
};

/** Traduz uma cor vinda do engine. Uma cor nova (ativo/evento novo) passa
 *  direto em vez de sumir — pior um tom fora do tema que texto invisível. */
export function corDoEngine(cor: string): string {
  return MAPA_COR_ENGINE[cor.toLowerCase()] ?? cor;
}
