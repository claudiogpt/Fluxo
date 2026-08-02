// Tipos da camada de CONTEÚDO educacional.
//
// Três coleções, uma fonte cada:
//   GATILHOS  — os eventos de jogo que destravam conteúdo (declarativos);
//   ESTUDOS   — os textos de FUNDAMENTOS (como aquilo funciona fora do jogo);
//   MANUAL    — referência estática de regras, modos, cenários e atalhos.
//
// Os TERMOS do glossário não estão aqui de propósito: eles já moram em
// engine/conceitos.js, que é o dicionário central. Esta camada aponta PARA
// aquele dicionário (por id) e nunca copia texto dele.

/** Tela a que uma seção do manual responde (usado pelo `?` contextual).
 *  Lista fechada: o teste cobra que todo contexto tenha pelo menos uma seção,
 *  senão o `?` abriria vazio em alguma tela. */
export const CONTEXTOS = [
  'jogo',
  'menu',
  'modos',
  'cenarios',
  'setup',
  'biblioteca',
  'config',
] as const;

export type ContextoAjuda = (typeof CONTEXTOS)[number];

/** Um evento de jogo que destrava conteúdo. Só dados — quem observa o estado
 *  e dispara é o listener middleware (store), nunca este arquivo. */
export interface Gatilho {
  id: string;
  /** frase declarativa, em minúsculas: "primeira alocação em ações" */
  descricao: string;
  /** linha do rodapé, mostrada uma única vez. SÓ para gatilhos sem tooltip:
   *  onde o modal educacional já existe, ele é quem ensina. */
  licao?: string;
  /** termos que este gatilho destrava. SÓ para gatilhos sem tooltip — com
   *  tooltip, quem manda é `tooltips[id].termos`, no engine. */
  termos?: string[];
}

export interface Estudo {
  id: string;
  titulo: string;
  /** 3 a 8 minutos — declarado ao jogador antes de ele abrir */
  tempoLeituraMin: number;
  /** id em GATILHOS: o que destrava este estudo */
  gatilho: string;
  /** id de engine/conceitos.termos. É por ele que o glossário acha o estudo:
   *  a ligação termo → estudo é a INVERSÃO deste campo, não um campo novo lá. */
  conceitoPrincipal: string;
  /** demais termos citados, sem repetir o principal — viram links no rodapé */
  conceitosRelacionados: string[];
  /** markdown pobre: `## título`, parágrafos, `- lista`, `**forte**` */
  corpo: string;
  /** fecha o estudo devolvendo o jogador ao jogo: onde isso aparece lá */
  ondeApareceNoJogo: string;
}

/** Uma linha do par ENTRA/SAI: chave à esquerda, número à direita. O `tom`
 *  é semântico, não decorativo — quem escolhe a cor é a UI (--sucesso para
 *  dinheiro que entra, --perigo para o que sai), nunca este arquivo. */
export interface Numero {
  rotulo: string;
  valor: string;
  tom?: 'alta' | 'baixa' | 'neutro';
}

/** As duas saídas do jogo, quando a seção tem saída. */
export interface Desfecho {
  palavra: string;
  texto: string;
}

export interface SecaoManual {
  id: string;
  titulo: string;
  /** uma linha, mostrada na lista sem abrir a seção */
  resumo: string;
  /** telas em que o `?` abre direto nesta seção */
  contextos: ContextoAjuda[];
  /** frase de abertura do verbete, em prosa — o que a seção resolve.
   *  Opcional: sem ela o verbete começa direto no corpo. */
  chamada?: string;
  /** os números do capítulo ANTES de qualquer prosa. Opcional porque nem toda
   *  seção é sobre dinheiro entrando e saindo (ATALHOS não é). */
  numeros?: { entra: Numero[]; sai: Numero[] };
  desfechos?: { derrota: Desfecho; vitoria: Desfecho };
  corpo: string;
}
