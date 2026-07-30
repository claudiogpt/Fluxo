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
  conviteDispensado: false,
};
