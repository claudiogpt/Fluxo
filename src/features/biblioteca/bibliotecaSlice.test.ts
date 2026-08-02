// A biblioteca inteira: desbloqueio por experiência, hint, leitura, convite,
// diagnóstico da derrota e o `?` contextual.
//
// O que estes testes defendem, acima de tudo: nada aqui abre por navegação.
import { beforeEach, describe, expect, it } from 'vitest';
import { config, regras } from '../../engine';
import type { GameState } from '../../engine/types';
import { marcarVisto } from '../conceitos/conceitosSlice';
import { comecar, escolherModo, fecharMes } from '../game/gameSlice';
import { abrirAjuda } from '../ui/ajuda';
import { selectRota } from '../ui/uiSlice';
import { makeStore } from '../../store';
import { CHAVE_BIBLIOTECA } from './armazenamento';
import {
  abrirEstudo,
  abrirPrateleira,
  abrirSecao,
  abrirTermo,
  buscar,
  dispensarConvite,
  marcarLido,
  selectConviteTutorial,
  selectEstudoEmLeitura,
  selectEstudosNovos,
  selectFundamentosLista,
  selectGlossarioLista,
  selectHint,
  selectIndice,
  selectProgresso,
  selectSubtituloBiblioteca,
  selectVerbeteAberto,
  selectVerbeteId,
  selectVizinhos,
  viveu,
} from './bibliotecaSlice';
import { selectDiagnostico } from './diagnostico';

describe('bibliotecaSlice — o que o jogador viveu', () => {
  beforeEach(() => localStorage.clear());

  it('viveu é idempotente', () => {
    const store = makeStore();
    store.dispatch(viveu('saldoNegativo'));
    store.dispatch(viveu('saldoNegativo'));
    expect(store.getState().biblioteca.vividos).toEqual(['saldoNegativo']);
  });

  it('só gatilho com lição levanta o hint — onde há modal, não há linha', () => {
    const store = makeStore();
    store.dispatch(viveu('saldoNegativo'));
    expect(selectHint(store.getState())?.licao).toBeTruthy();

    const outro = makeStore();
    // 'acoes' tem tooltip: o modal educacional já ensina essa cena
    outro.dispatch(viveu('acoes'));
    expect(selectHint(outro.getState())).toBeNull();
  });

  it('o hint aparece uma vez só: revivido, o gatilho não levanta linha nova', () => {
    const store = makeStore();
    store.dispatch(viveu('saldoNegativo'));
    store.dispatch(fecharMes()); // o mês vira e a linha some
    expect(selectHint(store.getState())).toBeNull();
    store.dispatch(viveu('saldoNegativo'));
    expect(selectHint(store.getState())).toBeNull();
  });

  it('estudo abre por gatilho, e o subtítulo do menu conta os não lidos', () => {
    const store = makeStore();
    expect(selectFundamentosLista(store.getState()).abertos).toHaveLength(0);
    expect(selectSubtituloBiblioteca(store.getState())).not.toMatch(/estudo/);

    store.dispatch(viveu('liquidacaoForcada'));
    expect(selectEstudosNovos(store.getState())).toEqual(['liquidez-e-venda-forcada']);
    expect(selectSubtituloBiblioteca(store.getState())).toMatch(/· 1 estudo novo$/);

    // abrir É ler: não existe botão "marcar como lido"
    store.dispatch(abrirEstudo('liquidez-e-venda-forcada'));
    expect(selectEstudosNovos(store.getState())).toEqual([]);
    expect(selectSubtituloBiblioteca(store.getState())).not.toMatch(/estudo/);
  });

  it('nenhum convite de leitura leva a lugar nenhum', () => {
    const store = makeStore();
    // 'sequencia' tem tooltip: quem registra é o marcarVisto do conceitosSlice
    // (o outro lado da união), e ele abre o termo E o estudo de uma vez
    store.dispatch(marcarVisto('sequencia'));
    const comEstudo = selectGlossarioLista(store.getState()).abertos.filter((t) => t.estudo);
    expect(comEstudo.map((t) => t.estudo!.id)).toEqual(['sequencia-de-retornos']);

    // o rodapé do estudo só cita termos já abertos
    store.dispatch(abrirEstudo('sequencia-de-retornos'));
    const abertos = selectGlossarioLista(store.getState()).abertos.map((t) => t.id);
    const citados = selectEstudoEmLeitura(store.getState())!.conceitos.map((c) => c.id);
    expect(citados.every((id) => abertos.includes(id))).toBe(true);
  });

  it('persiste o progresso e o recupera no reload', () => {
    const store = makeStore();
    store.dispatch(viveu('saldoNegativo'));
    store.dispatch(marcarLido('sequencia-de-retornos'));
    store.dispatch(dispensarConvite());

    const outro = makeStore();
    expect(outro.getState().biblioteca.vividos).toEqual(['saldoNegativo']);
    expect(outro.getState().biblioteca.estudosLidos).toEqual(['sequencia-de-retornos']);
    expect(outro.getState().biblioteca.conviteDispensado).toBe(true);
    // navegação NÃO atravessa sessões
    expect(outro.getState().biblioteca.prateleiraAtiva).toBe('glossario');
  });

  it('descarta ids que não existem mais no conteúdo', () => {
    localStorage.setItem(
      CHAVE_BIBLIOTECA,
      JSON.stringify({ vividos: ['saldoNegativo', 'gatilho-que-morreu'], estudosLidos: ['sumiu'] })
    );
    const store = makeStore();
    expect(store.getState().biblioteca.vividos).toEqual(['saldoNegativo']);
    expect(store.getState().biblioteca.estudosLidos).toEqual([]);
  });
});

describe('convite do tutorial (camada 2)', () => {
  beforeEach(() => localStorage.clear());

  it('aparece na primeira sessão e some pra sempre com o [X]', () => {
    const store = makeStore();
    expect(selectConviteTutorial(store.getState())).toBe(true);
    store.dispatch(dispensarConvite());
    expect(selectConviteTutorial(store.getState())).toBe(false);
    expect(selectConviteTutorial(makeStore().getState())).toBe(false);
  });

  it('some sozinho depois que o jogador vive qualquer coisa', () => {
    const store = makeStore();
    store.dispatch(viveu('saldoNegativo'));
    expect(selectConviteTutorial(store.getState())).toBe(false);
  });

  it('não reaparece pra quem já jogou o tutorial, mesmo sem viver nada', () => {
    const store = makeStore();
    store.dispatch(escolherModo('tutorial'));
    store.dispatch(comecar());
    expect(store.getState().biblioteca.conviteDispensado).toBe(true);
    expect(selectConviteTutorial(makeStore().getState())).toBe(false);
  });

  it('começar outro modo não mexe no convite', () => {
    const store = makeStore();
    store.dispatch(escolherModo('sandbox'));
    store.dispatch(comecar());
    expect(selectConviteTutorial(store.getState())).toBe(true);
  });
});

describe('tutorial (camada 1)', () => {
  beforeEach(() => localStorage.clear());

  it('termina sozinho no prazo declarado e não vai pro placar', () => {
    const store = makeStore();
    store.dispatch(escolherModo('tutorial'));
    store.dispatch(comecar());
    for (let i = 0; i < config.tutorial.meses; i++) store.dispatch(fecharMes());
    const g = store.getState().game;
    expect(g.mes).toBe(config.tutorial.meses);
    expect(g.fim).toBe('desafio_ok');
    // nenhum registro local: a primeira partida de alguém não é ranking
    expect(localStorage.getItem('fluxo_placar_v1')).toBeNull();
  });
});

describe('diagnóstico da derrota (etapa F)', () => {
  // Estado fabricado de propósito: o que se testa é o MAPA causa → estudo,
  // e depender de uma partida real pra falir tornaria o teste um sorteio.
  const estadoFinal = (extra: Partial<GameState>): { game: GameState } => ({
    game: { ...regras.novoJogo({ dificuldade: 'hardcore', salarioInicial: 4500 }), ...extra },
  });

  it('venda forçada aponta pro estudo de liquidez', () => {
    const d = selectDiagnostico(estadoFinal({ fim: 'faliu', liquidacaoNoMes: true, mes: 34 }));
    expect(d?.mes).toBe(34);
    expect(d?.estudo?.id).toBe('liquidez-e-venda-forcada');
    expect(d?.estudo?.conceito).toBe('margin call');
  });

  it('aposentadoria que zerou aponta pra sequência de retornos', () => {
    const d = selectDiagnostico(estadoFinal({ fim: 'apos_faliu' }));
    expect(d?.estudo?.id).toBe('sequencia-de-retornos');
  });

  it('sem derrota, sem diagnóstico — e vitória não inventa causa', () => {
    expect(selectDiagnostico(estadoFinal({}))).toBeNull();
    expect(selectDiagnostico(estadoFinal({ fim: 'livre' }))).toBeNull();
  });
});

// O fichário só existe porque as três prateleiras viram a MESMA forma. Estes
// testes defendem essa uniformidade: se um dia glossário e fundamentos
// divergirem de novo, a lateral e o painel precisariam saber em qual estão.
describe('fichário — o índice uniforme', () => {
  beforeEach(() => localStorage.clear());

  it('as três prateleiras devolvem a mesma forma de índice', () => {
    const store = makeStore();
    // o tooltip da liquidação forçada destrava o termo `marginCall` (regra do
    // engine) E o estudo que tem esse gatilho — as três prateleiras com carga
    store.dispatch(marcarVisto('liquidacaoForcada'));

    for (const p of ['glossario', 'manual', 'fundamentos'] as const) {
      store.dispatch(abrirPrateleira(p));
      const indice = selectIndice(store.getState());
      expect(indice.length, p).toBeGreaterThan(0);
      for (const item of indice) {
        expect(typeof item.id).toBe('string');
        expect(typeof item.titulo).toBe('string');
        expect(typeof item.ativo).toBe('boolean');
      }
      // exatamente um ativo, sempre — o painel mostra um verbete por vez
      expect(indice.filter((i) => i.ativo)).toHaveLength(1);
    }
  });

  it('sem seleção guardada, o primeiro item do índice é o aberto', () => {
    const store = makeStore();
    store.dispatch(abrirPrateleira('manual'));
    expect(store.getState().biblioteca.secaoAberta).toBeNull();
    expect(selectVerbeteId(store.getState())).toBe('regras');
    expect(selectVerbeteAberto(store.getState())?.titulo).toBe('COMO O MÊS FECHA');
  });

  it('a seleção guardada vence o primeiro item', () => {
    const store = makeStore();
    store.dispatch(abrirSecao('atalhos'));
    expect(selectVerbeteId(store.getState())).toBe('atalhos');
  });

  it('a busca filtra sem acento e sem caixa, e o aberto acompanha o filtro', () => {
    const store = makeStore();
    store.dispatch(abrirPrateleira('manual'));
    store.dispatch(abrirSecao('regras'));
    store.dispatch(buscar('ATALHO'));

    const indice = selectIndice(store.getState());
    expect(indice.map((i) => i.id)).toEqual(['atalhos']);
    // 'regras' saiu do índice, então não pode continuar aberto no painel —
    // senão a estante listaria uma coisa e o painel mostraria outra
    expect(selectVerbeteId(store.getState())).toBe('atalhos');
  });

  it('busca sem resultado esvazia o índice e não deixa verbete aberto', () => {
    const store = makeStore();
    store.dispatch(abrirPrateleira('manual'));
    store.dispatch(buscar('zzzz'));
    expect(selectIndice(store.getState())).toEqual([]);
    expect(selectVerbeteAberto(store.getState())).toBeNull();
  });

  it('trocar de prateleira limpa a busca', () => {
    const store = makeStore();
    store.dispatch(buscar('juro'));
    store.dispatch(abrirPrateleira('manual'));
    expect(store.getState().biblioteca.busca).toBe('');
  });

  it('os vizinhos param nas pontas', () => {
    const store = makeStore();
    store.dispatch(abrirSecao('regras')); // primeiro do manual
    expect(selectVizinhos(store.getState()).anterior).toBeNull();
    expect(selectVizinhos(store.getState()).proximo?.id).toBe('modos');

    store.dispatch(abrirSecao('atalhos')); // último
    expect(selectVizinhos(store.getState()).proximo).toBeNull();
    expect(selectVizinhos(store.getState()).anterior?.id).toBe('cenarios');
  });

  it('o verbete do glossário traz a definição como prosa, e o estudo como convite', () => {
    const store = makeStore();
    store.dispatch(marcarVisto('liquidacaoForcada'));
    store.dispatch(abrirTermo('marginCall'));
    const v = selectVerbeteAberto(store.getState());
    expect(v?.titulo).toBe('Margin call');
    expect(v?.chamada).toBeTruthy();
    expect(v?.corpo).toBeUndefined(); // a definição já é o conteúdo
    expect(v?.estudo?.id).toBe('liquidez-e-venda-forcada');
  });

  it('o convite [L] só aparece quando o estudo também está aberto', () => {
    const store = makeStore();
    // peculium vem destravado de fábrica e não tem estudo nenhum atrás dele
    expect(selectVerbeteAberto(store.getState())?.titulo).toBe('Peculium');
    expect(selectVerbeteAberto(store.getState())?.estudo).toBeUndefined();
  });

  it('o progresso conta por prateleira, e o manual não tem barra', () => {
    const store = makeStore();
    store.dispatch(abrirPrateleira('manual'));
    expect(selectProgresso(store.getState())).toBeNull();

    store.dispatch(abrirPrateleira('glossario'));
    const g = selectProgresso(store.getState());
    expect(g?.total).toBeGreaterThan(0);
    expect(g?.feitos).toBeLessThanOrEqual(g!.total);

    store.dispatch(marcarVisto('liquidacaoForcada'));
    store.dispatch(abrirEstudo('liquidez-e-venda-forcada')); // abrir É ler
    store.dispatch(abrirPrateleira('fundamentos'));
    expect(selectProgresso(store.getState())?.feitos).toBe(1);
  });

  it('fundamentos marca NOVO só no que ainda não foi lido', () => {
    const store = makeStore();
    store.dispatch(marcarVisto('liquidacaoForcada'));
    store.dispatch(abrirPrateleira('fundamentos'));
    expect(selectIndice(store.getState())[0].marca).toBe('NOVO');

    store.dispatch(marcarLido('liquidez-e-venda-forcada'));
    store.dispatch(abrirPrateleira('fundamentos'));
    expect(selectIndice(store.getState())[0].marca).toBeUndefined();
  });
});

describe('`?` contextual (etapa E)', () => {
  beforeEach(() => localStorage.clear());

  it('no menu leva à biblioteca, no manual, na seção da tela', () => {
    const store = makeStore();
    store.dispatch(abrirAjuda());
    expect(selectRota(store.getState())).toBe('biblioteca');
    expect(store.getState().biblioteca.prateleiraAtiva).toBe('manual');
    expect(store.getState().biblioteca.secaoAberta).toBe('regras');
  });

  it('no jogo abre o overlay, sem navegar', () => {
    const store = makeStore();
    store.dispatch(comecar());
    store.dispatch(abrirPrateleira('glossario'));
    store.dispatch(abrirAjuda());
    expect(store.getState().ui.bibliotecaAberta).toBe(true);
    expect(selectRota(store.getState())).toBe('home');
    expect(store.getState().biblioteca.prateleiraAtiva).toBe('manual');
  });
});
