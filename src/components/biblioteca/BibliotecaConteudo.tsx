// O miolo da BIBLIOTECA, sem moldura. Tem dois donos: o overlay que abre sobre
// a mesa durante a partida (OverlayBiblioteca) e a página do menu
// (menu/PaginaBiblioteca). Um componente só porque é o mesmo conteúdo — a
// diferença entre os dois é a casca, não o que está dentro.
//
// Três prateleiras numeradas 01/02/03. A numeração não é enfeite: é o atalho.
// Nada aqui vira botão se puder ser uma linha de texto com tecla.
import type { ComponentType, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  abrirEstudo,
  abrirPrateleira,
  abrirTermo,
  alternarSecao,
  comoDestravar,
  fecharEstudo,
  selectContadorLongo,
  selectEstudoEmLeitura,
  selectFundamentosLista,
  selectGlossarioLista,
  selectManualSecoes,
  selectPrateleira,
  selectTermoFoco,
} from '../../features/biblioteca';
import { PRATELEIRAS, type Prateleira } from '../../features/biblioteca';
import type { AppDispatch } from '../../store';
import { Desfechos } from './Desfechos';
import { Markdown } from './Markdown';

const NOMES: Record<Prateleira, string> = {
  glossario: 'GLOSSÁRIO',
  manual: 'MANUAL',
  fundamentos: 'FUNDAMENTOS',
};

const estilos = {
  abas: {
    display: 'flex',
    gap: 4,
    borderBottom: '1px solid var(--borda)',
    marginBottom: 14,
  },
  // Longhand em vez de `border`/`borderBottom`: o estado ativo troca só a cor,
  // e misturar shorthand com longhand no mesmo elemento é bug de estilo em
  // rerender (o React avisa, e com razão).
  aba: {
    background: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    color: 'var(--texto-apagado)',
    fontFamily: 'inherit',
    fontSize: 11,
    letterSpacing: 1,
    padding: '6px 10px',
    cursor: 'pointer',
  },
  abaAtiva: { color: 'var(--texto-forte)', borderBottomColor: 'var(--sucesso)' },
  num: { color: 'var(--texto-apagado)', marginRight: 6, fontSize: 10 },
  cartao: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--borda-suave)',
    background: 'var(--fundo)',
    borderRadius: 4,
    padding: '10px 14px',
  },
  nome: { fontWeight: 700, fontSize: 12, letterSpacing: 0.5, color: 'var(--texto-forte)' },
  definicao: { fontSize: 11.5, color: 'var(--texto-fraco)', marginTop: 2 },
  linha: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    marginTop: 6,
    fontFamily: 'inherit',
    fontSize: 11,
    letterSpacing: 0.5,
    color: 'var(--sucesso)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  trancados: { color: 'var(--texto-apagado)', fontSize: 11, marginTop: 4 },
  grade: { display: 'grid', gap: 8 },
} satisfies Record<string, CSSProperties>;

/** Convite de leitura: uma linha, nunca um botão. `[L]` é o mesmo rótulo que
 *  aparece no rodapé do jogo e na tela de derrota — mesma tecla, mesma ação. */
function LinhaLer({ label, aoClicar }: { label: string; aoClicar: () => void }) {
  return (
    <button type="button" style={estilos.linha} onClick={aoClicar}>
      {label}
    </button>
  );
}

function Glossario() {
  const { abertos, trancados } = useSelector(selectGlossarioLista);
  const foco = useSelector(selectTermoFoco);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div style={estilos.grade}>
      {abertos.length === 0 && (
        <div style={estilos.trancados}>
          nenhum termo ainda — eles abrem sozinhos conforme as coisas acontecem na partida.
        </div>
      )}
      {abertos.map((t) => (
        <div
          key={t.id}
          style={{
            ...estilos.cartao,
            // o foco é a volta do estudo pro termo: sem ele, o jogador cairia
            // numa lista e teria que procurar o que ele mesmo pediu.
            borderColor: t.id === foco ? 'var(--sucesso)' : 'var(--borda-suave)',
          }}
        >
          <div style={estilos.nome}>{t.nome}</div>
          <div style={estilos.definicao}>{t.definicao}</div>
          {t.estudo && (
            <LinhaLer
              label={`[L] ler: ${t.estudo.titulo.toLowerCase()} · ${t.estudo.tempoLeituraMin} min`}
              aoClicar={() => dispatch(abrirEstudo(t.estudo!.id))}
            />
          )}
        </div>
      ))}
      {trancados > 0 && (
        <div style={estilos.trancados}>
          + {trancados} {trancados > 1 ? 'termos trancados' : 'termo trancado'} — abrem quando o
          conceito aparece na partida.
        </div>
      )}
    </div>
  );
}

function Manual() {
  const secoes = useSelector(selectManualSecoes);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div style={estilos.grade}>
      {secoes.map((s) => (
        <div key={s.id} style={estilos.cartao}>
          <button
            type="button"
            onClick={() => dispatch(alternarSecao(s.id))}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              width: '100%',
              textAlign: 'left',
              fontFamily: 'inherit',
              cursor: 'pointer',
              color: 'inherit',
            }}
            aria-expanded={s.aberta}
          >
            <div style={estilos.nome}>
              <span style={estilos.num} aria-hidden="true">
                {s.aberta ? '▾' : '▸'}
              </span>
              {s.titulo}
            </div>
            <div style={estilos.definicao}>{s.resumo}</div>
          </button>
          {s.aberta && (
            <>
              <Markdown corpo={s.corpo} />
              {s.desfechos && <Desfechos {...s.desfechos} compacto />}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function Fundamentos() {
  const { abertos, trancados } = useSelector(selectFundamentosLista);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div style={estilos.grade}>
      {abertos.length === 0 && (
        <div style={estilos.trancados}>
          nenhum estudo ainda. Eles abrem depois — quando a partida te fizer passar por aquilo.
        </div>
      )}
      {abertos.map((e, i) => (
        <div key={e.id} style={estilos.cartao}>
          <div style={estilos.nome}>
            <span style={estilos.num} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            {e.titulo}
            {e.novo && (
              <span style={{ color: 'var(--sucesso)', fontSize: 10, marginLeft: 8 }}>NOVO</span>
            )}
          </div>
          <LinhaLer
            label={`[L] ler · ${e.tempoLeituraMin} min`}
            aoClicar={() => dispatch(abrirEstudo(e.id))}
          />
        </div>
      ))}
      {trancados > 0 && (
        <div style={estilos.trancados}>
          + {trancados} {trancados > 1 ? 'estudos trancados' : 'estudo trancado'} — cada um abre
          depois do que ele explica acontecer com você.
        </div>
      )}
    </div>
  );
}

/** Estudo aberto. Termina SEMPRE apontando de volta pro jogo e pros termos —
 *  a ligação é de mão dupla por regra, não por gentileza. */
function Leitura() {
  const e = useSelector(selectEstudoEmLeitura);
  const dispatch = useDispatch<AppDispatch>();
  if (!e) return null;

  return (
    <div>
      <button
        type="button"
        style={{ ...estilos.linha, marginTop: 0, marginBottom: 10, color: 'var(--texto-fraco)' }}
        onClick={() => dispatch(fecharEstudo())}
      >
        ◂ FUNDAMENTOS
      </button>
      <div style={{ ...estilos.nome, fontSize: 15 }}>{e.titulo}</div>
      <div style={{ ...estilos.trancados, marginTop: 2 }}>
        {e.tempoLeituraMin} min de leitura · destravado por {comoDestravar(e.conceitoPrincipal)}
      </div>
      <Markdown corpo={e.corpo} />
      <div style={{ ...estilos.cartao, marginTop: 18 }}>
        <div style={{ ...estilos.trancados, marginTop: 0 }}>ONDE ISSO APARECE NO JOGO</div>
        <div style={{ ...estilos.definicao, marginTop: 4 }}>{e.ondeApareceNoJogo}</div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {e.conceitos.map((c) => (
          <LinhaLer
            key={c.id}
            label={`↗ ${c.nome}`}
            aoClicar={() => dispatch(abrirTermo(c.id))}
          />
        ))}
      </div>
    </div>
  );
}

const CORPOS: Record<Prateleira, ComponentType> = {
  glossario: Glossario,
  manual: Manual,
  fundamentos: Fundamentos,
};

export function BibliotecaConteudo() {
  const prateleira = useSelector(selectPrateleira);
  const lendo = useSelector(selectEstudoEmLeitura);
  const contador = useSelector(selectContadorLongo);
  const dispatch = useDispatch<AppDispatch>();
  const Corpo = CORPOS[prateleira];

  return (
    <div>
      <div style={estilos.abas} role="tablist">
        {PRATELEIRAS.map((p, i) => (
          <button
            key={p}
            role="tab"
            aria-selected={p === prateleira}
            type="button"
            onClick={() => dispatch(abrirPrateleira(p))}
            style={{ ...estilos.aba, ...(p === prateleira ? estilos.abaAtiva : null) }}
          >
            <span style={estilos.num} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            {NOMES[p]}
          </button>
        ))}
      </div>
      {lendo ? (
        <Leitura />
      ) : (
        <>
          {prateleira === 'glossario' && (
            <div style={{ ...estilos.trancados, marginTop: 0, marginBottom: 10 }}>{contador}</div>
          )}
          <Corpo />
        </>
      )}
    </div>
  );
}
