// Placar (global quando o board remoto carregou, local como fallback) —
// portado 1:1 do Leaderboard do protótipo DC (git history); dados do placarSlice.
import { useSelector } from 'react-redux';
import { selectLeaderboard } from '../features/placar/placarSlice';

export function Leaderboard() {
  const { lbLista, lbTitulo, lbTituloCor } = useSelector(selectLeaderboard);
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2833', borderRadius: 6, overflow: 'hidden', color: '#d7e1ea', fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.5 }}>
      <div style={{ background: '#11161d', borderBottom: '1px solid #1e2833', padding: '8px 14px', fontSize: 10, letterSpacing: 2, color: lbTituloCor }}>
        {lbTitulo}
      </div>
      <div style={{ padding: '10px 14px', display: 'grid', gap: 6, fontSize: 11.5 }}>
        {lbLista.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', background: p.bg, borderRadius: 3, padding: '2px 6px' }}>
            <span style={{ color: '#3a4a5a', flex: 'none', width: 20 }}>{p.pos}</span>
            <span style={{ color: '#d7e1ea', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</span>
            <span style={{ color: p.cor, fontWeight: 600, flex: 'none' }}>{p.status}</span>
            <span style={{ color: '#8fa1b2', flex: 'none' }}>{p.detalhe}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
