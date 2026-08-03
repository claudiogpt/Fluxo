// API consolidada do conteúdo educacional.
//
// O dicionário central de TERMOS continua sendo engine/conceitos.js. Este
// módulo não copia nada de lá: ele indexa. Toda ligação entre as coleções é
// DERIVADA de um único campo, nunca guardada dos dois lados —
//
//   termo → estudo     inverte Estudo.conceitoPrincipal
//   termo → gatilho     inverte conceitos.tooltips[x].termos (regra do engine)
//   gatilho → estudo    lê Estudo.gatilho
//
// — porque campo espelhado é campo que sai de sincronia na primeira edição.

import { conceitos } from '../engine';
import type { Termo } from '../engine/types';
import { ESTUDOS } from './fundamentos';
import { gatilho } from './gatilhos';
import { MANUAL } from './manual';
import type { ContextoAjuda, Estudo, Gatilho, SecaoManual } from './tipos';

export { DIAGNOSTICOS, diagnosticar, type Diagnostico } from './diagnosticos';
export { ESTUDOS, estudo } from './fundamentos';
export { GATILHOS, GATILHOS_COM_LICAO, gatilho, type GatilhoId } from './gatilhos';
export { MANUAL, secaoManual } from './manual';
export { CONTEXTOS } from './tipos';
export type { ContextoAjuda, Desfecho, Estudo, Gatilho, Numero, SecaoManual } from './tipos';

/** Todos os termos do glossário, do dicionário central. */
export const TERMOS: Record<string, Termo> = conceitos.termos;

export const TOTAL_TERMOS = Object.keys(conceitos.termos).length;

/** O estudo que aprofunda este termo — o link do glossário pra FUNDAMENTOS. */
export function estudoDoConceito(conceitoId: string): Estudo | null {
  return ESTUDOS.find((e) => e.conceitoPrincipal === conceitoId) ?? null;
}

/** Termos que o estudo cita, o principal primeiro — o rodapé de volta pro
 *  glossário. Ids desconhecidos são descartados, não quebram a tela. */
export function conceitosDoEstudo(e: Estudo): { id: string; nome: string }[] {
  return [e.conceitoPrincipal, ...e.conceitosRelacionados]
    .filter((id) => conceitos.termos[id])
    .map((id) => ({ id, nome: conceitos.termos[id].nome }));
}

/** O que, no jogo, destrava este termo. Vem da regra que já existe no engine
 *  (tooltip visto destrava os termos que ele cita), só que legível. */
export function gatilhosDoConceito(conceitoId: string): Gatilho[] {
  return Object.keys(conceitos.tooltips)
    .filter((id) => conceitos.tooltips[id].termos.includes(conceitoId))
    .map((id) => gatilho(id))
    .filter((g): g is Gatilho => g !== null);
}

/** Um gatilho tem tooltip quando o engine já ensina aquilo por modal. */
export const temTooltip = (gatilhoId: string): boolean => !!conceitos.tooltips[gatilhoId];

/** Termos destravados por gatilhos SEM tooltip. Os COM tooltip continuam
 *  saindo da regra do engine — aqui só entra o que ela não alcança. */
export function termosDeGatilhos(ids: readonly string[]): string[] {
  const fora: string[] = [];
  for (const id of ids) {
    for (const t of gatilho(id)?.termos ?? []) if (!fora.includes(t)) fora.push(t);
  }
  return fora;
}

export const estudosDoGatilho = (gatilhoId: string): Estudo[] =>
  ESTUDOS.filter((e) => e.gatilho === gatilhoId);

/** Seções do manual que respondem por esta tela — a base do `?` contextual. */
export const secoesDoContexto = (ctx: ContextoAjuda): SecaoManual[] =>
  MANUAL.filter((s) => s.contextos.includes(ctx));
