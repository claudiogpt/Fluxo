// Tipos hand-written do engine UMD (engine/*.js). A fonte da verdade da lógica
// continua sendo o JS; aqui só descrevemos o contrato que o app consome.

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

// ---- estado do jogo (shape produzido por regras.novoJogo) ----

export type AtivoKey = 'reserva' | 'rendafixa' | 'fiis' | 'acoes' | 'cripto';
export type Dificuldade = 'normal' | 'hardcore';
export type FimDeJogo = 'faliu' | 'livre' | 'apos_sucesso' | 'apos_faliu' | 'imoveis_fim';

export interface LogItem {
  id: number;
  mes: string;
  texto: string;
  cor: string;
}

export interface EstadoAposentadoria {
  fase: 'acumulacao' | 'saque';
  saqueModo: 'fixo' | 'percentual';
  taxaSaque: number;
  turnosAcumulacao: number;
  turnosSaque: number;
  saquesFeitos: number;
  saqueMes: number;
  esgotou: boolean;
}

export interface EstadoImoveis {
  escolha: 'comprar' | 'alugar';
  prazo: number;
  pagas: number;
  parcela: number;
  aluguel: number;
  valorImovel: number;
  carteiraAluguel: number;
  varImovelMes: number;
}

export interface EstadoNegocio {
  caixa: number;
  receitaBase: number;
  custoFixo: number;
  nivel: number;
  mesesNoVermelho: number;
  falido: boolean;
  receitaMes: number | null;
  varReceitaMes: number;
}

export interface GameState {
  tela: 'intro' | 'jogo';
  dificuldade: Dificuldade;
  modo: string;
  cenario: string | null;
  capitalInicial: number | null;
  aposentadoria: EstadoAposentadoria | null;
  imoveis: EstadoImoveis | null;
  negocio: EstadoNegocio | null;
  mes: number;
  caixa: number;
  salario: number;
  custo: number;
  semSalario: number;
  ativos: Record<AtivoKey, number>;
  varMes: Record<AtivoKey, number>;
  hist: number[];
  log: LogItem[];
  fim: FimDeJogo | null;
  hard: boolean;
  auto: boolean;
  inicioTs: number | null;
  fimTs: number | null;
  agora: number;
  proximoLogId: number;
  // flags que o fecharMes pode criar depois do início
  marcoLivre?: boolean;
  liquidacaoNoMes?: boolean;
}

export interface NovoJogoProps {
  dificuldade?: Dificuldade;
  salarioInicial?: number;
  modo?: string;
  capitalInicial?: number | null;
  cenario?: string | null;
  saqueModo?: 'fixo' | 'percentual';
  imoveisEscolha?: 'comprar' | 'alugar';
}

// ---- regras ----
// Semântica mista (herdada do setState do DC): fecharMes MUTA e retorna o
// estado completo; os demais retornam PARCIAIS pra merge ({} = no-op).

export interface RegrasApi {
  novoJogo(props?: NovoJogoProps): GameState;
  fecharMes(s: GameState, opts?: { rng?: () => number }): GameState;
  mover(s: GameState, key: AtivoKey, valor: number): Partial<GameState>;
  aportarNegocio(s: GameState, valor: number): Partial<GameState>;
  sacarNegocio(s: GameState, valor: number): Partial<GameState>;
  reinvestirNegocio(s: GameState): Partial<GameState>;
  ganhoReinvestimento(nivel: number): number;
  rendaPassiva(s: GameState): number;
  patrimonio(s: GameState): number;
  saldoDevedor(im: EstadoImoveis): number;
  parcelaFinanciamento(principal: number, jurosMes: number, prazo: number): number;
}

// ---- ativos / formato / config ----

export interface AtivoDef {
  key: AtivoKey;
  nome: string;
  ticker: string;
  dica: string;
  risco: string;
  riscoCor: string;
  ret: number;
  vol: number;
  div: number;
}

export interface FormatoApi {
  fmt(v: number): string;
  fmtCompacto(v: number): string;
  fmtTempo(ms: number): string;
  sparkline(hist: number[]): { points: string; positivo: boolean };
}

export interface ModoDef {
  id: string;
  nome: string;
  descricao: string;
  disponivel: boolean;
}

export interface ConfigApi {
  salarioDefault: number;
  dificuldades: Record<Dificuldade, { caixaInicial: number; custoFator: number; chanceEvento: number; inflacaoBase: number }>;
  modos: ModoDef[];
  cenarios: ModoDef[];
  sandbox: { capitais: number[] };
  aposentadoria: { capitalInicial: number; salario: number; turnosAcumulacao: number; turnosSaque: number; taxaSaque: number };
  empresario: { caixaInicial: number; receitaBase: number; custoFixo: number; volReceita: number; reinvestimentoPasso: number; impulsoReceita: number; decaimento: number; mesesFalencia: number };
  imoveis: { salario: number; custoFator: number; capitalInicial: number; valorImovel: number; entradaPct: number; jurosMes: number; prazoMeses: number; aluguel: number; valorizacaoMes: number; volImovel: number };
  placarOnline: { url: string; anonKey: string; tabela: string };
  mesMinimoEvento: number;
  progressaoAnual: number;
  logMax: number;
}

// ---- placar ----

export interface RegistroPlacar {
  nome: string;
  modo: string;
  detalhe: string;
  dificuldade: string;
  resultado: string;
  meses: number;
  pat: number;
  tempo: number;
  score: number;
  voce?: boolean;
  ts?: number;
}

export interface PlacarApi {
  CHAVE: string;
  CHAVE_NICK: string;
  nick(storage?: StorageLike | null): string;
  salvarNick(nome: string, storage?: StorageLike | null): void;
  boardDe(s: Pick<GameState, 'modo' | 'cenario'>): string;
  registro(s: GameState, patrimonio: number, nome: string, resultado?: string): RegistroPlacar;
  vitoria(resultado: string): boolean;
  ordenar(lista: RegistroPlacar[]): RegistroPlacar[];
  salvar(rec: RegistroPlacar, storage?: StorageLike | null): void;
  ler(modo: string, storage?: StorageLike | null): RegistroPlacar[];
  online(cfg?: { url?: string; anonKey?: string } | null): boolean;
  enviarRemoto(rec: RegistroPlacar, cfg?: unknown, fetchFn?: typeof fetch | null): Promise<boolean>;
  lerRemoto(modo: string, cfg?: unknown, fetchFn?: typeof fetch | null): Promise<RegistroPlacar[] | null>;
}

// ---- namespace global exposto pelo UMD (window.Fluxo) ----

export interface FluxoGlobal {
  conceitos: ConceitosApi;
  regras: RegrasApi;
  ativos: AtivoDef[];
  formato: FormatoApi;
  config: ConfigApi;
  placar: PlacarApi;
  eventos: unknown; // consumido só internamente pelo regras.fecharMes
}
