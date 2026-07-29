// Carteira do modo realista: 15 ativos não cabem numa lista só, então a tela
// mostra as CATEGORIAS e você entra numa delas.
//
// O estado de "qual categoria está aberta" mora no GameView (useState), como o
// da aba — não é regra de negócio e não pode encostar no gameSlice. E tudo
// isto vive DENTRO do painel de conteúdo que já existe: nenhum `.jogo-painel`
// novo, nenhuma media query nova, os testes de aba seguem valendo.
import { useSelector } from 'react-redux';
import { selectAtivosPorCategoria, selectCategoriasLista } from '../features/game/selectors';
import { AtivoCard } from './AtivoCard';

type Categorias = NonNullable<ReturnType<typeof selectCategoriasLista>>;

function CategoriaCard({ c, aoAbrir }: { c: Categorias[number]; aoAbrir: () => void }) {
  return (
    // <button> e não <div onClick>: foca com Tab, responde a Enter e é
    // anunciado como controle — a mesma lição do CartaoEscolha.
    <button
      onClick={aoAbrir}
      style={{
        display: 'grid', gap: 6, textAlign: 'left', width: '100%', cursor: 'pointer',
        background: 'var(--superficie-2)', border: '1px solid var(--borda)', borderRadius: 6,
        padding: '14px 16px', color: 'var(--texto)', font: 'inherit', fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, color: 'var(--texto-forte)', letterSpacing: 0.5 }}>{c.nome}</span>
        <span style={{ color: 'var(--texto-apagado)', fontSize: 11 }}>▸</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--texto-forte)' }}>{c.totalFmt}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: c.varCor }}>{c.varFmt}</span>
      </div>
      <div style={{ fontSize: 11, color: c.temPosicao ? 'var(--sucesso)' : 'var(--texto-rotulo)' }}>{c.rendaFmt}</div>
      <div className="dica-curta" style={{ fontSize: 11, color: 'var(--texto-rotulo)' }}>{c.dica}</div>
      <div style={{ fontSize: 10, letterSpacing: 1, color: 'var(--texto-apagado)' }}>{c.resumo}</div>
    </button>
  );
}

export function CarteiraCategorias({
  aberta,
  aoAbrir,
  aoVoltar,
}: {
  aberta: string | null;
  aoAbrir: (id: string) => void;
  aoVoltar: () => void;
}) {
  const categorias = useSelector(selectCategoriasLista);
  const porCategoria = useSelector(selectAtivosPorCategoria);
  if (!categorias) return null;

  const atual = aberta ? categorias.find((c) => c.id === aberta) : null;

  if (atual) {
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={aoVoltar}
            style={{
              background: 'transparent', border: '1px solid var(--borda)', color: 'var(--texto-rotulo)',
              fontSize: 10, letterSpacing: 1, padding: '6px 12px', borderRadius: 3, cursor: 'pointer',
            }}
          >
            ◂ CARTEIRA
          </button>
          <span style={{ fontWeight: 700, color: 'var(--texto-forte)', letterSpacing: 0.5 }}>{atual.nome}</span>
          <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 700, color: 'var(--texto-forte)' }}>
            {atual.totalFmt}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--texto-rotulo)' }}>{atual.dica}</div>
        {(porCategoria[atual.id] || []).map((a) => (
          <AtivoCard key={a.key} a={a} />
        ))}
      </div>
    );
  }

  return (
    // auto-fit resolve os três tamanhos sem breakpoint, como no PainelStatus
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
      {categorias.map((c) => (
        <CategoriaCard key={c.id} c={c} aoAbrir={() => aoAbrir(c.id)} />
      ))}
    </div>
  );
}
