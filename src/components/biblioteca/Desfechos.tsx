// As duas saídas do jogo, FALIU e LIVRE, lado a lado.
//
// Vive num arquivo próprio porque tem dois donos: o verbete do fichário e a
// seção do manual no overlay. Antes disso as duas saídas eram dois parágrafos
// em negrito dentro do corpo em markdown — viraram dado estruturado justamente
// pra não precisarem ser escritas duas vezes quando ganharam desenho.
import type { CSSProperties } from 'react';
import type { DesfechoVerbete } from '../../features/biblioteca';

interface Props {
  derrota: DesfechoVerbete;
  vitoria: DesfechoVerbete;
  /** a versão do overlay: mesma informação, sem os 24px de palavra */
  compacto?: boolean;
}

const rotulo: CSSProperties = {
  color: 'var(--texto-rotulo)',
  fontSize: 10,
  letterSpacing: 2,
  marginBottom: 6,
};

export function Desfechos({ derrota, vitoria, compacto }: Props) {
  const palavra: CSSProperties = {
    fontSize: compacto ? 15 : 24,
    fontWeight: 700,
    letterSpacing: '.08em',
    marginBottom: compacto ? 4 : 8,
  };
  const texto: CSSProperties = compacto
    ? { fontSize: 12, lineHeight: 1.5, color: 'var(--texto-fraco)' }
    : {
        fontFamily: 'var(--fonte-prosa)',
        fontSize: 17,
        lineHeight: 1.45,
        color: 'var(--texto-fraco)',
      };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${compacto ? 180 : 240}px, 1fr))`,
        border: '1px solid var(--borda)',
        marginTop: compacto ? 12 : 8,
      }}
    >
      {/* tint, e não --perigo-fundo/--sucesso-fundo: aqueles são o par de
          preenchimento dos BOTÕES de aporte e resgate, no talo de propósito.
          Aqui a área é grande, e o tema manda tingir de leve o que é painel. */}
      <div style={{ background: 'var(--tint-perigo)', padding: compacto ? 14 : 22 }}>
        <div style={rotulo}>DERROTA</div>
        <div style={{ ...palavra, color: 'var(--perigo)' }}>{derrota.palavra}</div>
        <div style={texto}>{derrota.texto}</div>
      </div>
      <div style={{ background: 'var(--tint-sucesso)', padding: compacto ? 14 : 22 }}>
        <div style={rotulo}>VITÓRIA</div>
        <div style={{ ...palavra, color: 'var(--sucesso)' }}>{vitoria.palavra}</div>
        <div style={texto}>{vitoria.texto}</div>
      </div>
    </div>
  );
}
