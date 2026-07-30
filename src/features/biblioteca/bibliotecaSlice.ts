// A BIBLIOTECA: glossário, manual e fundamentos.
//
// O slice guarda o mínimo (o que foi vivido, o que foi lido, onde estou) e
// DERIVA o resto dos catálogos em src/conteudo. Nenhuma lista de termos ou de
// estudos é copiada pra cá: o que atravessa sessões são ids.
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  ESTUDOS,
  MANUAL,
  TERMOS,
  TOTAL_TERMOS,
  conceitosDoEstudo,
  estudoDoConceito,
  estudosDoGatilho,
  gatilho,
  gatilhosDoConceito,
  termosDeGatilhos,
} from '../../conteudo';
import { selectTermosDesbloqueados } from '../conceitos/conceitosSlice';
import type { ConceitosState } from '../conceitos/conceitosSlice';
import { fecharMes, voltarMenu } from '../game/gameSlice';
import { lerProgresso } from './armazenamento';
import { BIBLIOTECA_INICIAL, type BibliotecaState, type Prateleira } from './tipos';

const bibliotecaSlice = createSlice({
  name: 'biblioteca',
  // Lazy: o progresso salvo entra na criação do store, como o conceitosSlice.
  initialState: (): BibliotecaState => ({ ...BIBLIOTECA_INICIAL, ...lerProgresso() }),
  reducers: {
    /** Registra um gatilho SEM tooltip. Idempotente: é o que garante que a
     *  linha do rodapé apareça uma vez só, sem uma segunda lista de flags —
     *  se o id já está em `vividos`, não há hint novo. */
    viveu(state, action: PayloadAction<string>) {
      if (state.vividos.includes(action.payload)) return;
      state.vividos.push(action.payload);
      if (gatilho(action.payload)?.licao) state.hintAtual = action.payload;
    },
    fecharHint(state) {
      state.hintAtual = null;
    },
    marcarLido(state, action: PayloadAction<string>) {
      if (!state.estudosLidos.includes(action.payload)) state.estudosLidos.push(action.payload);
    },
    abrirPrateleira(state, action: PayloadAction<Prateleira>) {
      state.prateleiraAtiva = action.payload;
      state.estudoAberto = null;
      state.termoFoco = null;
    },
    abrirEstudo(state, action: PayloadAction<string>) {
      state.prateleiraAtiva = 'fundamentos';
      state.estudoAberto = action.payload;
      // Abrir É ler: não existe botão "marcar como lido" — seria um botão a mais
      // pra dizer o que a própria ação já disse.
      if (!state.estudosLidos.includes(action.payload)) state.estudosLidos.push(action.payload);
    },
    fecharEstudo(state) {
      state.estudoAberto = null;
    },
    /** A volta do estudo pro glossário. Sem o foco, o jogador cairia numa
     *  lista de termos sem saber qual deles ele pediu. */
    abrirTermo(state, action: PayloadAction<string>) {
      state.prateleiraAtiva = 'glossario';
      state.estudoAberto = null;
      state.termoFoco = action.payload;
    },
    /** Abre uma seção do manual EXATAMENTE nela — é o que o `?` contextual
     *  precisa: chamar duas vezes na mesma tela tem que continuar abrindo. */
    abrirSecao(state, action: PayloadAction<string | null>) {
      state.prateleiraAtiva = 'manual';
      state.estudoAberto = null;
      state.secaoAberta = action.payload;
    },
    /** O clique na lista, que é sanfona: clicar na aberta fecha. */
    alternarSecao(state, action: PayloadAction<string>) {
      state.prateleiraAtiva = 'manual';
      state.secaoAberta = state.secaoAberta === action.payload ? null : action.payload;
    },
    dispensarConvite(state) {
      state.conviteDispensado = true;
    },
  },
  extraReducers: (builder) => {
    // A linha do rodapé vale pelo mês em que aconteceu. Limpar aqui, ANTES do
    // listener que registra os gatilhos deste mês, é o que deixa o hint novo
    // sobreviver: fecharMes apaga, o listener escreve por cima.
    builder.addCase(fecharMes, (state) => {
      state.hintAtual = null;
    });
    builder.addCase(voltarMenu, (state) => {
      state.hintAtual = null;
      state.estudoAberto = null;
    });
  },
});

export const {
  viveu,
  fecharHint,
  marcarLido,
  abrirPrateleira,
  abrirEstudo,
  fecharEstudo,
  abrirTermo,
  abrirSecao,
  alternarSecao,
  dispensarConvite,
} = bibliotecaSlice.actions;
export const bibliotecaReducer = bibliotecaSlice.reducer;

// ---- selectors ----
// Tipados contra as fatias (não o RootState) pra evitar import circular.
type ComBiblioteca = { biblioteca: BibliotecaState; conceitos: ConceitosState };

export const selectBiblioteca = (s: ComBiblioteca) => s.biblioteca;
export const selectVividos = (s: ComBiblioteca) => s.biblioteca.vividos;
export const selectEstudosLidos = (s: ComBiblioteca) => s.biblioteca.estudosLidos;
export const selectPrateleira = (s: ComBiblioteca) => s.biblioteca.prateleiraAtiva;
export const selectEstudoAberto = (s: ComBiblioteca) => s.biblioteca.estudoAberto;
export const selectSecaoAberta = (s: ComBiblioteca) => s.biblioteca.secaoAberta;
export const selectTermoFoco = (s: ComBiblioteca) => s.biblioteca.termoFoco;
export const selectConviteDispensado = (s: ComBiblioteca) => s.biblioteca.conviteDispensado;

/** Tudo o que o jogador viveu: os gatilhos com tooltip (regra do engine) mais
 *  os sem tooltip (registrados aqui). É a entrada de todo o resto. */
export const selectGatilhosVividos = createSelector(
  [(s: ComBiblioteca) => s.conceitos.vistos, selectVividos],
  (comTooltip, semTooltip) => [...comTooltip, ...semTooltip]
);

export const selectConceitosDesbloqueados = createSelector(
  [selectTermosDesbloqueados, selectVividos],
  (doEngine, vividos) => [...new Set([...doEngine, ...termosDeGatilhos(vividos)])]
);

export const selectContadorGlossario = createSelector(
  [selectConceitosDesbloqueados],
  (abertos) => `${abertos.length}/${TOTAL_TERMOS}`
);

/** Mesmo dado por extenso: cabe no cabeçalho da prateleira. */
export const selectContadorLongo = createSelector(
  [selectContadorGlossario],
  (c) => `${c} termos desbloqueados`
);

export const selectEstudosDesbloqueados = createSelector([selectGatilhosVividos], (vividos) =>
  ESTUDOS.filter((e) => vividos.includes(e.gatilho)).map((e) => e.id)
);

/** O glossário mostra o que está aberto e CONTA o que falta — a parede de
 *  "???" desanimava mais do que motivava.
 *
 *  O convite de leitura só entra quando o estudo TAMBÉM está aberto: termo e
 *  estudo têm gatilhos próprios, e oferecer o que ainda não existe seria um
 *  link pra lugar nenhum. */
export const selectGlossarioLista = createSelector(
  [selectConceitosDesbloqueados, selectEstudosDesbloqueados],
  (abertos, estudos) => ({
    abertos: Object.keys(TERMOS)
      .filter((id) => abertos.includes(id))
      .map((id) => {
        const e = estudoDoConceito(id);
        return {
          id,
          nome: TERMOS[id].nome,
          definicao: TERMOS[id].definicao,
          estudo: e && estudos.includes(e.id) ? e : null,
        };
      }),
    trancados: TOTAL_TERMOS - abertos.length,
  })
);

/** Alimenta o "· N estudos novos" do menu: desbloqueado e ainda não lido. */
export const selectEstudosNovos = createSelector(
  [selectEstudosDesbloqueados, selectEstudosLidos],
  (abertos, lidos) => abertos.filter((id) => !lidos.includes(id))
);

export const selectFundamentosLista = createSelector(
  [selectEstudosDesbloqueados, selectEstudosLidos],
  (abertos, lidos) => ({
    abertos: ESTUDOS.filter((e) => abertos.includes(e.id)).map((e) => ({
      id: e.id,
      titulo: e.titulo,
      tempoLeituraMin: e.tempoLeituraMin,
      novo: !lidos.includes(e.id),
    })),
    trancados: ESTUDOS.length - abertos.length,
  })
);

/** A linha do rodapé do jogo. Não é modal, não pausa, não pede clique — e só
 *  oferece o `[L]` quando existe estudo pra aquele gatilho. */
export const selectHint = createSelector([(s: ComBiblioteca) => s.biblioteca.hintAtual], (id) => {
  const g = id ? gatilho(id) : null;
  if (!id || !g?.licao) return null;
  const e = estudosDoGatilho(id)[0] ?? null;
  return {
    licao: g.licao,
    estudo: e ? { id: e.id, tempoLeituraMin: e.tempoLeituraMin } : null,
  };
});

/** Página aberta de um estudo, com o rodapé que devolve o jogador ao jogo.
 *
 *  Os termos do rodapé são filtrados pelos DESBLOQUEADOS: um link que leva a
 *  uma lista onde o termo ainda não existe é um beco sem saída, e ler um
 *  estudo não pode ser um atalho pra destravar o glossário sem viver a cena. */
export const selectEstudoEmLeitura = createSelector(
  [selectEstudoAberto, selectConceitosDesbloqueados],
  (id, abertos) => {
    const e = id ? ESTUDOS.find((x) => x.id === id) : null;
    if (!e) return null;
    return { ...e, conceitos: conceitosDoEstudo(e).filter((c) => abertos.includes(c.id)) };
  }
);

export const selectManualSecoes = createSelector([selectSecaoAberta], (aberta) =>
  MANUAL.map((s) => ({ id: s.id, titulo: s.titulo, resumo: s.resumo, corpo: s.corpo, aberta: s.id === aberta }))
);

/** Subtítulo do botão da home. O sufixo condicional é o ÚNICO elemento de
 *  descoberta do menu — sem estudo novo, ele simplesmente não existe. */
export const selectSubtituloBiblioteca = createSelector(
  [selectContadorGlossario, selectEstudosNovos],
  (contador, novos) => {
    const base = `${contador} termos · manual`;
    if (!novos.length) return base;
    return `${base} · ${novos.length} estudo${novos.length > 1 ? 's' : ''} novo${novos.length > 1 ? 's' : ''}`;
  }
);

/** O convite do tutorial (camada 2): só na primeira sessão de verdade — nada
 *  vivido ainda — e some pra sempre com o [X]. Não reaparece: quem já jogou
 *  não precisa ser convidado a começar. */
export const selectConviteTutorial = createSelector(
  [selectConviteDispensado, selectGatilhosVividos],
  (dispensado, vividos) => !dispensado && vividos.length === 0
);

/** Como se destrava um termo, em português — usado onde a UI precisa dizer o
 *  que falta fazer sem listar o conteúdo trancado. */
export const comoDestravar = (conceitoId: string): string =>
  gatilhosDoConceito(conceitoId)[0]?.descricao ?? 'jogando';
