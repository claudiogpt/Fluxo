// Ponte entre o engine UMD (engine/*.js, não reescrever) e o app React/TS.
//
// O UMD tem dois branches, e cada ambiente cai num deles:
// - Browser/Vite dev: sem `module` → registra em `globalThis.Fluxo` (efeito
//   colateral do import). É o mesmo caminho do protótipo via <script src>.
// - Vitest/Node (e node --test): com `module` → exporta via CommonJS e o
//   import namespace traz a API em `.default`; o global NÃO é populado.
// O shim aceita os dois: prefere o global e cai no export CJS quando preciso.
//
// Nenhum arquivo do engine muda — protótipo e os 68 testes seguem intactos.

// A ORDEM importa no branch browser: cada módulo se registra em
// `globalThis.Fluxo` como efeito do import, e `regras.js` lê catalogo/realista
// do global no momento em que é avaliado. Por isso os dois vêm antes dele.
import * as configM from '../../engine/config.js';
import * as ativosM from '../../engine/ativos.js';
import * as formatoM from '../../engine/formato.js';
import * as eventosM from '../../engine/eventos.js';
import * as placarM from '../../engine/placar.js';
import * as conceitosM from '../../engine/conceitos.js';
import * as catalogoM from '../../engine/catalogo.js';
import * as realistaM from '../../engine/realista.js';
import * as regrasM from '../../engine/regras.js';

import type {
  AtivoDef,
  CatalogoApi,
  ConceitosApi,
  ConfigApi,
  FluxoGlobal,
  FormatoApi,
  PlacarApi,
  RealistaApi,
  RegrasApi,
} from './types';

const global_ = globalThis as { Fluxo?: FluxoGlobal };

/** Pega a API do global (browser) ou do export CommonJS (Vitest/Node). */
function api<T>(nome: keyof FluxoGlobal, mod: unknown): T {
  const doGlobal = global_.Fluxo?.[nome];
  const doCjs = (mod as { default?: T }).default;
  const escolhido = (doGlobal ?? doCjs) as T | undefined;
  if (!escolhido) {
    throw new Error(`engine não carregou: Fluxo.${String(nome)} ausente (nem global, nem CJS).`);
  }
  return escolhido;
}

export const conceitos = api<ConceitosApi>('conceitos', conceitosM);
export const config = api<ConfigApi>('config', configM);
export const ativos = api<AtivoDef[]>('ativos', ativosM);
export const formato = api<FormatoApi>('formato', formatoM);
export const placar = api<PlacarApi>('placar', placarM);
export const catalogo = api<CatalogoApi>('catalogo', catalogoM);
export const realista = api<RealistaApi>('realista', realistaM);
export const regras = api<RegrasApi>('regras', regrasM);

// Demais módulos ficam disponíveis pros próximos passos (tipagem cresce sob demanda).
const Fluxo: FluxoGlobal = global_.Fluxo ?? {
  config: (configM as { default?: unknown }).default,
  ativos: (ativosM as { default?: unknown }).default,
  formato: (formatoM as { default?: unknown }).default,
  eventos: (eventosM as { default?: unknown }).default,
  placar: (placarM as { default?: unknown }).default,
  conceitos,
  catalogo,
  realista,
  regras: (regrasM as { default?: unknown }).default,
} as FluxoGlobal;

export default Fluxo;
