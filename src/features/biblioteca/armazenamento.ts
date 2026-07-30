// Persistência do progresso da biblioteca. Mesma disciplina do prefs: valida
// campo a campo em vez de spread cego — e filtra ids desconhecidos, porque
// conteúdo é editado com frequência e um estudo renomeado não pode deixar um
// contador de "novos" travado num id que não existe mais.
import { ESTUDOS, gatilho } from '../../conteudo';
import type { BibliotecaState, ProgressoSalvo } from './tipos';

export const CHAVE_BIBLIOTECA = 'fluxo_biblioteca_v1'; // convenção fluxo_*_vN

const soConhecidos = (v: unknown, existe: (id: string) => boolean): string[] =>
  Array.isArray(v) ? v.filter((id): id is string => typeof id === 'string' && existe(id)) : [];

export function lerProgresso(): ProgressoSalvo {
  try {
    const cru: unknown = JSON.parse(localStorage.getItem(CHAVE_BIBLIOTECA) || '{}');
    const o = (typeof cru === 'object' && cru !== null ? cru : {}) as Record<string, unknown>;
    return {
      vividos: soConhecidos(o.vividos, (id) => !!gatilho(id)),
      estudosLidos: soConhecidos(o.estudosLidos, (id) => ESTUDOS.some((e) => e.id === id)),
      conviteDispensado: o.conviteDispensado === true,
    };
  } catch {
    return { vividos: [], estudosLidos: [], conviteDispensado: false };
  }
}

export function salvarProgresso(s: BibliotecaState): void {
  try {
    const salvavel: ProgressoSalvo = {
      vividos: s.vividos,
      estudosLidos: s.estudosLidos,
      conviteDispensado: s.conviteDispensado,
    };
    localStorage.setItem(CHAVE_BIBLIOTECA, JSON.stringify(salvavel));
  } catch {
    /* sem storage: só não persiste */
  }
}
