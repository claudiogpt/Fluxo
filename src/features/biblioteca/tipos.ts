// Estado da BIBLIOTECA: o que o jogador já viveu, o que já leu e onde está.
//
// Por que o registro de gatilhos vive PARTIDO entre dois slices:
//   conceitos.vistos  → gatilhos COM tooltip (chave fluxo_conceitos_v1, a
//                       mesma do protótipo; marcar visto também suprime o modal)
//   biblioteca.vividos → gatilhos SEM tooltip (não têm modal a suprimir)
// Os dois conjuntos são disjuntos por construção — um gatilho tem tooltip ou
// não tem — e a união deles é "o que o jogador viveu". Guardar tudo aqui
// significaria escrever o mesmo id em dois lugares no primeiro aporte.

export type Prateleira = 'glossario' | 'manual' | 'fundamentos';

export const PRATELEIRAS: readonly Prateleira[] = ['glossario', 'manual', 'fundamentos'];

// ---- as duas formas UNIFORMES do fichário ----
// São o que faz a mesma lateral e o mesmo painel servirem as três prateleiras.
// Cada prateleira guarda o que quiser (termo, seção, estudo); os selectors
// traduzem tudo para estas duas formas, e a UI não sabe em qual está.

/** Uma linha do índice na lateral. */
export interface ItemIndice {
  id: string;
  titulo: string;
  /** selo à direita — hoje só o NOVO de fundamentos. Nada de contagem
   *  decorativa: número na lateral tem que significar alguma coisa. */
  marca?: string;
  ativo: boolean;
}

/** O verbete aberto no painel de leitura. Quase tudo é opcional porque as três
 *  prateleiras têm formatos diferentes de conteúdo — um termo é uma definição,
 *  uma seção de manual tem números, um estudo tem rodapé de volta pro jogo. */
export interface VerbeteAberto {
  id: string;
  /** rótulo 10px acima do título */
  rotulo: string;
  titulo: string;
  /** abertura em prosa, 20px — no glossário é a própria definição */
  chamada?: string;
  numeros?: { entra: NumeroVerbete[]; sai: NumeroVerbete[] };
  desfechos?: { derrota: DesfechoVerbete; vitoria: DesfechoVerbete };
  /** markdown pobre; ausente no glossário, onde a definição já é o conteúdo */
  corpo?: string;
  /** o fecho dos estudos, que devolve o leitor à mesa */
  ondeApareceNoJogo?: string;
  /** termos citados (fundamentos → glossário) */
  relacionados: { id: string; nome: string }[];
  /** o convite [L] (glossário → fundamentos) */
  estudo?: { id: string; titulo: string; tempoLeituraMin: number };
}

export interface NumeroVerbete {
  rotulo: string;
  valor: string;
  tom?: 'alta' | 'baixa' | 'neutro';
}

export interface DesfechoVerbete {
  palavra: string;
  texto: string;
}

/** Progresso da prateleira, pra barra da lateral. `null` no manual: ele não
 *  destrava nem se lê por partes, então uma barra ali mentiria. */
export interface Progresso {
  feitos: number;
  total: number;
  texto: string;
}

export interface BibliotecaState {
  /** gatilhos sem tooltip já vividos — serve de desbloqueio E de "hint já mostrado" */
  vividos: string[];
  estudosLidos: string[];
  prateleiraAtiva: Prateleira;
  /** estudo em leitura; null = lista da prateleira */
  estudoAberto: string | null;
  /** seção do manual expandida; null = nenhuma */
  secaoAberta: string | null;
  /** termo destacado ao voltar de um estudo pro glossário */
  termoFoco: string | null;
  /** gatilho cuja linha está no rodapé do jogo AGORA. Transitório (não é
   *  salvo): quem garante o "uma vez só" é `vividos`, não este campo. */
  hintAtual: string | null;
  /** filtro do índice do fichário. Transitório e limpo ao trocar de
   *  prateleira: busca que sobrevive à sessão é ruído, e busca que sobrevive à
   *  aba faz o jogador achar que a prateleira nova está vazia. */
  busca: string;
  /** o convite de tutorial da primeira sessão já foi dispensado com [X].
   *  Mora junto do progresso de leitura porque é da mesma natureza: registro
   *  do que este jogador já viu, não preferência de aparência. */
  conviteDispensado: boolean;
}

/** O que atravessa sessões. Navegação (prateleira, estudo, seção) fica de
 *  fora de propósito: reabrir o jogo na seção que você leu ontem é ruído. */
export interface ProgressoSalvo {
  vividos: string[];
  estudosLidos: string[];
  conviteDispensado: boolean;
}

export const BIBLIOTECA_INICIAL: BibliotecaState = {
  vividos: [],
  estudosLidos: [],
  prateleiraAtiva: 'glossario',
  estudoAberto: null,
  secaoAberta: null,
  termoFoco: null,
  hintAtual: null,
  busca: '',
  conviteDispensado: false,
};
