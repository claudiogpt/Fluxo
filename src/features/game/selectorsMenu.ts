// View-model do MENU. Separado do selectors.ts (que é o view-model do jogo, já
// com 300+ linhas) porque o consumidor é outro e a cadência de mudança também.
//
// Duas diferenças de desenho em relação ao antigo selectIntroConfig:
// 1. entradas estreitas (s.game.modo em vez do game inteiro), senão a lista de
//    modos recomputava a cada tick de 500ms do loop;
// 2. nada de cor no view-model — os grupos devolvem só o valor selecionado e
//    quem resolve o estilo é o componente, com tokens.
import { createSelector } from '@reduxjs/toolkit';
import { config, formato } from '../../engine';
import type { GameState, ModoDef } from '../../engine/types';

type ComGame = { game: GameState };

const { fmt } = formato;

/** 'cenarios' é um modo no engine, mas na UI virou um botão de primeiro nível:
 *  a lista de MODOS o esconde pra não haver dois caminhos pro mesmo lugar. */
export const PSEUDO_MODO_CENARIOS = 'cenarios';

export interface CartaoVM {
  id: string;
  nome: string;
  descricao: string;
  disponivel: boolean;
  selecionado: boolean;
  tag: string;
}

export interface OpcaoVM {
  id: string;
  rotulo: string;
}

export interface GrupoVM {
  valor: string;
  opcoes: OpcaoVM[];
  dica: string;
}

const cartao = (d: ModoDef, selecionado: boolean): CartaoVM => ({
  id: d.id,
  nome: d.nome,
  descricao: d.descricao,
  disponivel: d.disponivel,
  selecionado,
  tag: d.disponivel ? (selecionado ? '▸ SELECIONADO' : '') : 'EM BREVE',
});

const selectModo = (s: ComGame) => s.game.modo;
const selectCenario = (s: ComGame) => s.game.cenario;

export const selectModosLista = createSelector([selectModo], (modo) =>
  config.modos.filter((m) => m.id !== PSEUDO_MODO_CENARIOS).map((m) => cartao(m, m.id === modo))
);

export const selectCenariosLista = createSelector([selectCenario], (cenario) =>
  config.cenarios.map((c) => cartao(c, c.id === cenario))
);

/** Ajustes da partida + resumo, pra tela de setup do modo/cenário escolhido. */
export const selectSetupPagina = createSelector([(s: ComGame) => s.game], (s) => {
  const ap = s.aposentadoria;
  const im = s.imoveis;
  const cfgI = config.imoveis;
  const comprando = im?.escolha === 'comprar';
  const saqueFixo = ap?.saqueModo === 'fixo';
  const ehCenario = s.modo === PSEUDO_MODO_CENARIOS;
  const def = (ehCenario ? config.cenarios : config.modos).find(
    (d) => d.id === (ehCenario ? s.cenario : s.modo)
  );

  return {
    titulo: def?.nome ?? s.modo.toUpperCase(),
    descricao: def?.descricao ?? '',
    ehCenario,
    dificuldade: {
      valor: s.dificuldade,
      opcoes: [
        { id: 'normal', rotulo: 'NORMAL' },
        { id: 'hardcore', rotulo: 'HARDCORE' },
      ],
      dica:
        s.dificuldade === 'normal'
          ? 'mais folga no caixa e menos acidentes — bom pra aprender as mecânicas'
          : 'caixa inicial menor, custo de vida mais pesado e mais acidentes no caminho',
    } satisfies GrupoVM,
    capitais: (s.modo === 'sandbox'
      ? {
          valor: String(s.capitalInicial ?? ''),
          opcoes: config.sandbox.capitais.map((v) => ({ id: String(v), rotulo: fmt(v) })),
          dica: 'com quanto você começa o laboratório',
        }
      : null) as GrupoVM | null,
    saque: (ap
      ? {
          valor: ap.saqueModo,
          opcoes: [
            { id: 'fixo', rotulo: 'FIXO' },
            { id: 'percentual', rotulo: '% PATRIMÔNIO' },
          ],
          dica: saqueFixo
            ? 'saque fixo = seu custo de vida (inflaciona). É o que cria o risco de sequência.'
            : 'saque de ' + (ap.taxaSaque * 100).toFixed(0) + '% do patrimônio/mês — se ajusta sozinho e quase nunca zera.',
        }
      : null) as GrupoVM | null,
    estrategia: (im
      ? {
          valor: im.escolha,
          opcoes: [
            { id: 'comprar', rotulo: '🏠 COMPRAR FINANCIADO' },
            { id: 'alugar', rotulo: '📈 ALUGAR + INVESTIR' },
          ],
          dica: comprando
            ? 'entrada ' + fmt(Math.round(cfgI.valorImovel * cfgI.entradaPct)) + ' + ' + im.prazo + ' parcelas de ' + fmt(im.parcela) + ' — o imóvel é seu e valoriza'
            : 'aluguel ' + fmt(im.aluguel) + '/mês — sobra mais no bolso; disciplina decide se rende mais que o tijolo',
        }
      : null) as GrupoVM | null,
    // Mesma regra dos outros: olha se o ENGINE montou o sub-estado, não o nome
    // do modo. O cenário macro é a escolha que muda o jogo inteiro no realista.
    macro: (s.realista
      ? {
          valor: s.realista.macroInicial,
          opcoes: [
            { id: 'alta', rotulo: 'SELIC ALTA' },
            { id: 'baixa', rotulo: 'SELIC BAIXA' },
          ],
          dica: s.realista.macroInicial === 'alta'
            ? 'Selic em ' + (config.realista.selicAlta * 100).toFixed(2).replace('.', ',') + '%: renda fixa paga muito bem e a bolsa apanha. Prefixado longo é aposta em queda de juro.'
            : 'Selic em ' + (config.realista.selicBaixa * 100).toFixed(2).replace('.', ',') + '%: o pós-fixado rende pouco e vale correr risco. Prefixado longo é aposta em juro parado.',
        }
      : null) as GrupoVM | null,
    resumo:
      'capital inicial ' +
      fmt(s.caixa) +
      ' · ' +
      (ap
        ? 'acumula ' + ap.turnosAcumulacao + ' meses, depois saca por ' + ap.turnosSaque + ' meses'
        : im
          ? comprando
            ? 'parcela ' + fmt(im.parcela) + '/mês por ' + im.prazo + ' meses'
            : 'aluguel ' + fmt(im.aluguel) + '/mês · diferença sobra pra investir'
          : s.negocio
            ? 'negócio: giro ' + fmt(s.negocio.caixa) + ' · receita ~' + fmt(s.negocio.receitaBase) + ' − custos ' + fmt(s.negocio.custoFixo) + '/mês'
            : 'salário ' + fmt(s.salario) + '/mês') +
      ' · custo de vida ' +
      fmt(s.custo) +
      '/mês',
  };
});
