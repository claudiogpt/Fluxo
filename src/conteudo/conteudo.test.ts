// Integridade do conteúdo. Nada aqui testa lógica de jogo — testa que as três
// coleções continuam apontando umas pras outras depois de qualquer edição de
// texto. É o preço de derivar as ligações em vez de duplicá-las: um id errado
// não vira erro de compilação, então vira erro de teste.
import { describe, expect, it } from 'vitest';
import { conceitos } from '../engine';
import {
  CONTEXTOS,
  ESTUDOS,
  GATILHOS,
  MANUAL,
  TOTAL_TERMOS,
  conceitosDoEstudo,
  estudoDoConceito,
  estudosDoGatilho,
  gatilhosDoConceito,
  secoesDoContexto,
} from './index';

describe('estudos', () => {
  it('todo termo citado existe no dicionário central', () => {
    const desconhecidos = ESTUDOS.flatMap((e) =>
      [e.conceitoPrincipal, ...e.conceitosRelacionados].filter((id) => !conceitos.termos[id])
    );
    expect(desconhecidos).toEqual([]);
  });

  it('o principal não se repete nos relacionados — a lista não tem eco', () => {
    for (const e of ESTUDOS) expect(e.conceitosRelacionados).not.toContain(e.conceitoPrincipal);
  });

  it('cada termo aprofunda em no máximo um estudo (a inversão é determinística)', () => {
    const principais = ESTUDOS.map((e) => e.conceitoPrincipal);
    expect(new Set(principais).size).toBe(principais.length);
  });

  it('todo estudo é destravado por um gatilho que existe', () => {
    for (const e of ESTUDOS) expect(GATILHOS[e.gatilho as keyof typeof GATILHOS]).toBeTruthy();
  });

  it('o tempo de leitura declarado fica entre 3 e 8 minutos', () => {
    for (const e of ESTUDOS) {
      expect(e.tempoLeituraMin).toBeGreaterThanOrEqual(3);
      expect(e.tempoLeituraMin).toBeLessThanOrEqual(8);
    }
  });

  it('todo estudo fecha ligando de volta ao jogo', () => {
    for (const e of ESTUDOS) expect(e.ondeApareceNoJogo.trim().length).toBeGreaterThan(0);
  });
});

describe('gatilhos', () => {
  it('todo tooltip do engine tem gatilho de mesmo id', () => {
    // Se um tooltip novo aparecer no engine sem entrar aqui, a biblioteca não
    // saberia dizer ao jogador o que fazer pra destravar aquele termo.
    const semGatilho = Object.keys(conceitos.tooltips).filter(
      (id) => !GATILHOS[id as keyof typeof GATILHOS]
    );
    expect(semGatilho).toEqual([]);
  });

  it('gatilho leva ao estudo e o estudo volta ao gatilho', () => {
    const [primeiro] = ESTUDOS;
    expect(estudosDoGatilho(primeiro.gatilho)).toContain(primeiro);
  });
});

describe('ligação bidirecional', () => {
  it('do termo se chega ao estudo, e do estudo se volta ao termo', () => {
    const e = estudoDoConceito('sequenciaRetornos');
    expect(e?.id).toBe('sequencia-de-retornos');
    expect(conceitosDoEstudo(e!)[0]).toEqual({
      id: 'sequenciaRetornos',
      nome: conceitos.termos.sequenciaRetornos.nome,
    });
  });

  it('termo sem estudo devolve null em vez de estourar', () => {
    expect(estudoDoConceito('peculium')).toBeNull();
    expect(estudoDoConceito('nao-existe')).toBeNull();
  });

  it('o desbloqueio de um termo é descrito em português', () => {
    // volatilidade é citada pelos tooltips de ações e cripto
    expect(gatilhosDoConceito('volatilidade').map((g) => g.id)).toContain('acoes');
    expect(gatilhosDoConceito('volatilidade')[0].descricao).toMatch(/primeira alocação/);
  });

  it('o glossário continua com os 18 termos do dicionário central', () => {
    expect(TOTAL_TERMOS).toBe(18);
  });
});

describe('manual', () => {
  it('toda tela do jogo tem pelo menos uma seção pro `?` abrir', () => {
    for (const ctx of CONTEXTOS) expect(secoesDoContexto(ctx).length).toBeGreaterThan(0);
  });

  it('nenhuma seção fica órfã de contexto', () => {
    for (const s of MANUAL) expect(s.contextos.length).toBeGreaterThan(0);
  });

  it('ids únicos', () => {
    expect(new Set(MANUAL.map((s) => s.id)).size).toBe(MANUAL.length);
  });

  // Os campos do fichário são OPCIONAIS de propósito — nem toda seção é sobre
  // dinheiro entrando e saindo. O que não pode é meio preenchido: um card
  // ENTRA sem o SAI ao lado sai torto na tela.
  it('seção que declara números declara os dois lados, com conteúdo', () => {
    for (const s of MANUAL) {
      if (!s.numeros) continue;
      expect(s.numeros.entra.length, s.id).toBeGreaterThan(0);
      expect(s.numeros.sai.length, s.id).toBeGreaterThan(0);
      for (const n of [...s.numeros.entra, ...s.numeros.sai]) {
        expect(n.rotulo.trim(), s.id).not.toBe('');
        expect(n.valor.trim(), s.id).not.toBe('');
      }
    }
  });

  it('as duas saídas vivem no dado, não na prosa — em um lugar só', () => {
    const regras = MANUAL.find((s) => s.id === 'regras')!;
    expect(regras.desfechos?.derrota.palavra).toBe('FALIU');
    expect(regras.desfechos?.vitoria.palavra).toBe('LIVRE');
    // se voltarem pro corpo, o verbete passa a dizer a mesma coisa duas vezes
    for (const s of MANUAL) expect(s.corpo, s.id).not.toMatch(/\*\*(FALIU|LIVRE)\*\*/);
  });
});
