// Tipos hand-written do engine UMD (engine/*.js). Começam mínimos — cobrindo o
// que o app React consome hoje — e crescem conforme mais telas são migradas.
// Fonte da verdade da lógica continua sendo o JS; aqui só descrevemos o contrato.

// ---- conceitos ----

export interface Termo {
  nome: string;
  definicao: string;
}

export interface Tooltip {
  titulo: string;
  explicacao: string;
  termos: string[]; // ids de Termo
}

/** Storage mínimo injetável (subset de localStorage) usado pelo engine. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem?(key: string, value: string): void;
}

export interface ConceitosApi {
  CHAVE: string;
  termos: Record<string, Termo>;
  tooltips: Record<string, Tooltip>;
  vistos(storage?: StorageLike | null): string[];
  jaVisto(id: string, storage?: StorageLike | null): boolean;
  marcarVisto(id: string, storage?: StorageLike | null): void;
  termosDesbloqueados(storage?: StorageLike | null): string[];
}

// ---- namespace global exposto pelo UMD (window.Fluxo) ----
// Outras APIs (regras, placar, formato, …) serão adicionadas quando migrarmos
// as telas que as consomem.

export interface FluxoGlobal {
  conceitos: ConceitosApi;
  // regras, placar, formato, config, ativos, eventos: adicionar sob demanda.
}
