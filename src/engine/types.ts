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
  /** `sempre: true` = curiosidade, nasce desbloqueada (ver engine/conceitos.js) */
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

// ---- modo realista ----

/** Uma posição do catálogo realista. Tamanho FIXO: nada de lista de lotes —
 *  o estado inteiro passa por structuredClone a cada action. O IR sai de
 *  `custo` (custo médio) e `mesMedio` (idade média ponderada dos aportes). */
export interface PosicaoRealista {
  saldo: number;
  custo: number;
  mesMedio: number;
  /** mês do 1º aporte; null = nunca comprado (não há carência a contar) */
  mesEntrada: number | null;
  /** valor "na curva": o que o papel valeria sem marcação a mercado */
  curva: number;
}

export interface MacroRealista {
  selic: number;
  /** para onde o ciclo puxa a Selic; os eventos de COPOM movem o ALVO */
  selicAlvo: number;
  ipca: number;
  ipcaAlvo: number;
  /** variação da Selic no mês — entrada da marcação a mercado do prefixado */
  dPre: number;
  /** variação do juro REAL — marcação do IPCA+ */
  dReal: number;
}

export interface CustosRealista {
  adm: number;
  corretagem: number;
  comeCotas: number;
  ir: number;
}

export interface EstadoRealista {
  macroInicial: 'alta' | 'baixa';
  macro: MacroRealista;
  posicoes: Record<string, PosicaoRealista>;
  /** vendas do mês por classe — base dos tetos de isenção, zerada no fecharMes */
  vendasMes: { acoes: number; fii: number; cripto: number };
  mesCustos: CustosRealista;
  custosTotais: CustosRealista;
  mesRenda: number;
  choqueInflacao: number;
  mesesVacancia: number;
  mesesSemIsencao: number;
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
  realista: EstadoRealista | null;
  mes: number;
  caixa: number;
  salario: number;
  custo: number;
  semSalario: number;
  // `string` e não `AtivoKey`: no modo realista as chaves vêm do catálogo de 15
  // (`rf_selic`, `ac_blue`, …). `AtivoKey` continua valendo nas ACTIONS dos
  // modos clássicos — o que muda é só o armazenamento, que agora é aberto.
  ativos: Record<string, number>;
  varMes: Record<string, number>;
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
  macroInicial?: 'alta' | 'baixa';
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

// ---- catálogo do modo realista ----

export type Indexador = 'selic' | 'ipca' | 'pre' | null;
export type Tributacao = 'rf' | 'acoes' | 'fii' | 'cripto' | 'isento';

/** Definição de um papel do catálogo realista. Superset do AtivoDef: o que
 *  descreve o papel (indexador, prazo, tributação, custos) vive aqui; o que
 *  vale pro modo inteiro (alíquotas, tetos, ciclo macro) vive em config. */
export interface CatalogoDef {
  key: string;
  nome: string;
  ticker: string;
  categoria: string;
  indexador: Indexador;
  fatorIndex: number;
  taxaContratada: number;
  duration: number;
  fator: string | null;
  beta: number;
  ret: number;
  vol: number;
  div: number;
  tributacao: Tributacao;
  isencao: boolean;
  carencia: number;
  venceEm: number | null;
  taxaAdm: number;
  corretagem: number;
  spread: number;
  comeCotas: boolean;
  desagio: number;
  risco: string;
  riscoCor: string;
  conceito: string;
  dica: string;
}

export interface CategoriaDef {
  id: string;
  nome: string;
  dica: string;
}

export interface CatalogoApi {
  categorias: CategoriaDef[];
  defs: CatalogoDef[];
  ordemLiquidacao: string[];
  def(key: string): CatalogoDef | null;
  daCategoria(categoria: string): CatalogoDef[];
}

export interface RealistaApi {
  novoEstado(macroInicial?: 'alta' | 'baixa'): EstadoRealista;
  clonar(r: EstadoRealista): EstadoRealista;
  posicaoZerada(): PosicaoRealista;
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
  realista: {
    caixaInicial: number; salario: number; custoFator: number;
    selicAlta: number; selicBaixa: number; ipcaInicial: number;
    reversao: number; volSelic: number; volIpca: number;
    selicMin: number; selicMax: number; ipcaMin: number; ipcaMax: number;
    /** [mesesAté, alíquota] — regressiva: segurar por mais tempo paga menos */
    aliquotasRF: [number, number][];
    irAcoes: number; irFii: number; irCripto: number; irComeCotas: number;
    isencaoAcoes: number; isencaoCripto: number; comeCotasMeses: number;
    ordemMinima: number;
  };
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
  catalogo: CatalogoApi;
  realista: RealistaApi;
  formato: FormatoApi;
  config: ConfigApi;
  placar: PlacarApi;
  eventos: unknown; // consumido só internamente pelo regras.fecharMes
}
