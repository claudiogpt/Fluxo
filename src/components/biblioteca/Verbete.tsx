// O painel de leitura do fichário: UM verbete por vez, nunca uma pilha de
// sanfonas. A ordem é sempre a mesma — rótulo, título, abertura em prosa, os
// NÚMEROS antes de qualquer explicação, a explicação, e o rodapé que leva ao
// vizinho.
//
// Serve as três prateleiras porque só conhece VerbeteAberto: quem traduz termo,
// seção e estudo pra essa forma é o selector, não este arquivo.
import type { CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ABRIR_VERBETE,
  abrirEstudo,
  abrirTermo,
  selectPrateleira,
  selectVerbeteAberto,
  selectVizinhos,
  type NumeroVerbete,
} from '../../features/biblioteca';
import type { AppDispatch } from '../../store';
import { Desfechos } from './Desfechos';
import { Markdown } from './Markdown';

/** O tom é semântico e a tradução mora AQUI, não no conteúdo: dinheiro que
 *  entra é --sucesso, que sai é --perigo. Vale nos dois temas — o design de
 *  origem inverte isso no claro (convenção da bolsa chinesa) e nós não
 *  seguimos, pelo motivo documentado em tema.css. */
const TOM: Record<NonNullable<NumeroVerbete['tom']>, string> = {
  alta: 'var(--sucesso)',
  baixa: 'var(--perigo)',
  neutro: 'var(--texto-fraco)',
};

const estilos = {
  rotulo: {
    color: 'var(--sucesso)',
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 10,
  },
  cabecalho: {
    borderBottom: '2px solid var(--sucesso-solido)',
    paddingBottom: 20,
    marginBottom: 26,
  },
  titulo: {
    fontFamily: 'var(--fonte-prosa)',
    fontSize: 44,
    fontWeight: 500,
    lineHeight: 1.05,
    color: 'var(--texto-forte)',
    margin: '0 0 12px',
  },
  chamada: {
    fontFamily: 'var(--fonte-prosa)',
    fontSize: 20,
    lineHeight: 1.45,
    color: 'var(--texto-fraco)',
    margin: 0,
    maxWidth: 560,
  },
  numeros: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 12,
    marginBottom: 26,
  },
  cartaoNumero: {
    background: 'var(--superficie-2)',
    border: '1px solid var(--borda-suave)',
    padding: '16px 18px',
  },
  rotuloCartao: {
    color: 'var(--texto-rotulo)',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 10,
  },
  linhaNumero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    color: 'var(--texto)',
    fontSize: 13,
  },
  fecho: {
    border: '1px solid var(--borda-suave)',
    background: 'var(--superficie-2)',
    padding: '14px 16px',
    marginTop: 24,
  },
  rodape: {
    marginTop: 28,
    paddingTop: 16,
    borderTop: '1px solid var(--borda)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  vizinho: {
    background: 'transparent',
    border: '1px solid var(--borda)',
    color: 'var(--texto-fraco)',
    fontFamily: 'inherit',
    fontSize: 12,
    padding: '6px 12px',
    cursor: 'pointer',
    maxWidth: '46%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  linha: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: 12,
    letterSpacing: 0.5,
    color: 'var(--sucesso)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  vazio: { color: 'var(--texto-apagado)', fontSize: 12, lineHeight: 1.6 },
} satisfies Record<string, CSSProperties>;

function Numeros({ lado, itens }: { lado: string; itens: NumeroVerbete[] }) {
  return (
    <div style={estilos.cartaoNumero}>
      <div style={estilos.rotuloCartao}>{lado}</div>
      <div style={{ display: 'grid', gap: 7 }}>
        {itens.map((n) => (
          <div key={n.rotulo} style={estilos.linhaNumero}>
            <span>{n.rotulo}</span>
            <span style={{ color: TOM[n.tom ?? 'neutro'], fontWeight: n.tom ? 700 : 400 }}>
              {n.valor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Verbete({ aoVoltarAoIndice }: { aoVoltarAoIndice?: () => void }) {
  const v = useSelector(selectVerbeteAberto);
  const prateleira = useSelector(selectPrateleira);
  const { anterior, proximo } = useSelector(selectVizinhos);
  const dispatch = useDispatch<AppDispatch>();

  if (!v) {
    return (
      <div className="biblio-painel">
        <div style={estilos.vazio}>
          Esta prateleira ainda está vazia. Termos e estudos abrem quando aquilo acontece com você
          numa partida — não tem como adiantar por aqui.
        </div>
      </div>
    );
  }

  return (
    <div className="biblio-painel">
      {aoVoltarAoIndice && (
        <button
          type="button"
          className="biblio-ao-indice"
          style={{ ...estilos.linha, marginBottom: 14, color: 'var(--texto-fraco)' }}
          onClick={aoVoltarAoIndice}
        >
          ◂ ÍNDICE
        </button>
      )}

      <div style={estilos.cabecalho}>
        <div style={estilos.rotulo}>{v.rotulo}</div>
        <h2 style={estilos.titulo}>{v.titulo}</h2>
        {v.chamada && <p style={estilos.chamada}>{v.chamada}</p>}
      </div>

      {/* Os números vêm ANTES da prosa: é o que o design pede e é a ordem em
          que a pergunta aparece — quanto, depois por quê. */}
      {v.numeros && (
        <div style={estilos.numeros}>
          <Numeros lado="ENTRA" itens={v.numeros.entra} />
          <Numeros lado="SAI" itens={v.numeros.sai} />
        </div>
      )}

      {v.corpo && <Markdown corpo={v.corpo} variante="prosa" />}

      {v.desfechos && <Desfechos {...v.desfechos} />}

      {/* O convite de leitura do glossário: uma linha, nunca um botão, e com a
          mesma tecla [L] que o rodapé do jogo oferece. */}
      {v.estudo && (
        <button
          type="button"
          style={{ ...estilos.linha, marginTop: 18 }}
          onClick={() => dispatch(abrirEstudo(v.estudo!.id))}
        >
          [L] ler: {v.estudo.titulo.toLowerCase()} · {v.estudo.tempoLeituraMin} min
        </button>
      )}

      {v.ondeApareceNoJogo && (
        <div style={estilos.fecho}>
          <div style={estilos.rotuloCartao}>ONDE ISSO APARECE NO JOGO</div>
          <div style={{ color: 'var(--texto-fraco)', fontSize: 12.5, lineHeight: 1.6 }}>
            {v.ondeApareceNoJogo}
          </div>
        </div>
      )}

      {v.relacionados.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {v.relacionados.map((c) => (
            <button
              key={c.id}
              type="button"
              style={estilos.linha}
              onClick={() => dispatch(abrirTermo(c.id))}
            >
              ↗ {c.nome}
            </button>
          ))}
        </div>
      )}

      {/* Prateleira de um item só não ganha régua de rodapé: uma linha
          horizontal sem nada embaixo é moldura de um quadro vazio. */}
      {(anterior || proximo) && (
        <div style={estilos.rodape}>
          {anterior && (
            <button
              type="button"
              style={estilos.vizinho}
              onClick={() => dispatch(ABRIR_VERBETE[prateleira](anterior.id))}
            >
              ← {anterior.titulo}
            </button>
          )}
          <span style={{ flex: 1 }} />
          {proximo && (
            <button
              type="button"
              style={estilos.vizinho}
              onClick={() => dispatch(ABRIR_VERBETE[prateleira](proximo.id))}
            >
              {proximo.titulo} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
