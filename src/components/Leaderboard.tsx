// Placar (global quando o board remoto carregou, local como fallback) —
// portado 1:1 do Leaderboard do protótipo DC (git history); dados do placarSlice.
import { useSelector } from 'react-redux';
import { selectLeaderboard } from '../features/placar/placarSlice';

export function Leaderboard() {
  const { lbLista, lbTitulo, lbTituloCor } = useSelector(selectLeaderboard);
  return (
    <div style={{ background: 'var(--superficie)', border: '1px solid var(--borda)', borderRadius: 6, overflow: 'hidden', color: 'var(--texto)', lineHeight: 1.5 }}>
      <div style={{ background: 'var(--superficie-2)', borderBottom: '1px solid var(--borda)', padding: '8px 14px', fontSize: 10, letterSpacing: 2, color: lbTituloCor }}>
        {lbTitulo}
      </div>
      <div style={{ padding: '10px 14px', display: 'grid', gap: 6, fontSize: 11.5 }}>
        {lbLista.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', background: p.bg, borderRadius: 3, padding: '2px 6px' }}>
            <span style={{ color: 'var(--texto-apagado)', flex: 'none', width: 20 }}>{p.pos}</span>
            <span style={{ color: 'var(--texto)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</span>
            <span style={{ color: p.cor, fontWeight: 600, flex: 'none' }}>{p.status}</span>
            <span style={{ color: 'var(--texto-fraco)', flex: 'none' }}>{p.detalhe}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
