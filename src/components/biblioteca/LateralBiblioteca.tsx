// A estante do fichário: marca, busca, índice e progresso.
//
// Ela é ESCURA nos dois temas (tokens --biblio-lateral-*, em tema.css). Não é
// capricho: o painel de leitura muda de cor com o tema porque é papel, e a
// estante fica onde está porque é móvel. Por isso ela tem rampa de texto
// própria — usar --texto-* aqui daria tinta escura sobre laca no tema claro.
//
// Serve as três prateleiras sem saber em qual está: tudo que ela lê é
// ItemIndice, que os selectors montam a partir de termo, seção ou estudo.
import type { CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ABRIR_VERBETE,
  buscar,
  selectBusca,
  selectIndice,
  selectPrateleira,
  selectProgresso,
  selectTrancados,
} from '../../features/biblioteca';
import type { AppDispatch } from '../../store';

const NOMES: Record<string, string> = {
  glossario: 'GLOSSÁRIO',
  manual: 'MANUAL',
  fundamentos: 'FUNDAMENTOS',
};

const estilos = {
  marca: { padding: '22px 20px 18px', display: 'flex', alignItems: 'center', gap: 9 },
  ponto: { width: 7, height: 7, background: 'var(--sucesso-solido)', display: 'block' },
  nomeMarca: { color: 'var(--biblio-lateral-forte)', fontSize: 10, letterSpacing: 3 },
  caixaBusca: { padding: '16px 20px 14px', borderTop: '1px solid var(--biblio-lateral-linha)' },
  busca: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid var(--biblio-lateral-linha)',
    background: 'var(--biblio-lateral-campo)',
    color: 'var(--biblio-lateral-forte)',
    fontSize: 12,
    padding: '8px 10px',
  },
  rotulo: {
    padding: '6px 20px',
    color: 'var(--biblio-lateral-rotulo)',
    fontSize: 10,
    letterSpacing: 2,
  },
  lista: { display: 'flex', flexDirection: 'column', listStyle: 'none', margin: 0, padding: 0 },
  item: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    padding: '10px 20px',
    color: 'var(--biblio-lateral-texto)',
    fontFamily: 'inherit',
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  itemAtivo: {
    background: 'var(--sucesso-solido)',
    color: 'var(--sobre-sucesso)',
    fontWeight: 600,
  },
  marcaItem: { fontSize: 9, letterSpacing: 1, flexShrink: 0 },
  vazio: {
    padding: '10px 20px',
    color: 'var(--biblio-lateral-rotulo)',
    fontSize: 11,
    lineHeight: 1.5,
  },
  progresso: {
    margin: '20px 20px 0',
    paddingTop: 16,
    borderTop: '1px solid var(--biblio-lateral-linha)',
    color: 'var(--biblio-lateral-rotulo)',
    fontSize: 10,
    letterSpacing: 2,
  },
  trilho: { height: 6, background: 'var(--biblio-lateral-linha)', display: 'block' },
  legenda: { color: 'var(--biblio-lateral-texto)', fontSize: 11, marginTop: 7 },
} satisfies Record<string, CSSProperties>;

export function LateralBiblioteca({ aoEscolher }: { aoEscolher?: () => void }) {
  const prateleira = useSelector(selectPrateleira);
  const indice = useSelector(selectIndice);
  const trancados = useSelector(selectTrancados);
  const progresso = useSelector(selectProgresso);
  const busca = useSelector(selectBusca);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="biblio-lateral">
      <div style={estilos.marca}>
        <span style={estilos.ponto} aria-hidden="true" />
        <span style={estilos.nomeMarca}>BIBLIOTECA</span>
      </div>

      <div style={estilos.caixaBusca}>
        <input
          type="search"
          style={estilos.busca}
          placeholder="buscar termo…"
          aria-label="buscar nesta prateleira"
          value={busca}
          onChange={(e) => dispatch(buscar(e.target.value))}
        />
      </div>

      <div style={estilos.rotulo}>
        {NOMES[prateleira]} · {indice.length}
      </div>

      {/* ul/li de verdade, com o botão DENTRO do item: pôr role="listitem" no
          próprio botão faria o leitor de tela anunciar item de lista e perder
          que aquilo é clicável. */}
      <ul style={estilos.lista} aria-label={`Índice · ${NOMES[prateleira]}`}>
        {indice.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-current={item.ativo ? 'true' : undefined}
              style={{ ...estilos.item, ...(item.ativo ? estilos.itemAtivo : null) }}
              onClick={() => {
                dispatch(ABRIR_VERBETE[prateleira](item.id));
                aoEscolher?.();
              }}
            >
              <span>{item.titulo}</span>
              {item.marca && <span style={estilos.marcaItem}>{item.marca}</span>}
            </button>
          </li>
        ))}
      </ul>

      {indice.length === 0 && (
        <div style={estilos.vazio}>
          {busca
            ? 'nada com esse nome nesta prateleira.'
            : 'nada aberto ainda — isto se destrava jogando, não navegando.'}
        </div>
      )}

      {trancados > 0 && (
        <div style={{ ...estilos.vazio, paddingTop: 14 }}>
          + {trancados} {trancados > 1 ? 'trancados' : 'trancado'}
        </div>
      )}

      {progresso && (
        <>
          <div style={estilos.progresso}>PROGRESSO</div>
          <div style={{ padding: '10px 20px 0' }}>
            <div
              style={estilos.trilho}
              role="progressbar"
              aria-valuenow={progresso.feitos}
              aria-valuemin={0}
              aria-valuemax={progresso.total}
              aria-label={progresso.texto}
            >
              <span
                style={{
                  display: 'block',
                  height: '100%',
                  width: `${(progresso.feitos / progresso.total) * 100}%`,
                  background: 'var(--aviso-cheio)',
                }}
              />
            </div>
            <div style={estilos.legenda}>{progresso.texto}</div>
          </div>
        </>
      )}
    </div>
  );
}
