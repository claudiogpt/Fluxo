// Card da moradia (cenário imóveis): estratégia + corrida contra o fantasma —
// portado 1:1 do ImovelCard do protótipo DC (git history).
import { useSelector } from 'react-redux';
import { selectImovelCard } from '../features/game/selectors';

const mono = "'IBM Plex Mono',monospace";

export function ImovelCard() {
  const im = useSelector(selectImovelCard);
  if (!im) return null;

  return (
    <div style={{ background: '#0a1420', border: '1px solid #1e3a52', borderRadius: 6, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', alignItems: 'center', color: '#d7e1ea', fontFamily: mono, fontSize: 13, lineHeight: 1.5 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#4bb7ff', letterSpacing: 0.5 }}>MORADIA</span>
          <span style={{ fontSize: 10, letterSpacing: 1, color: '#4bb7ff', border: '1px solid #4bb7ff', borderRadius: 3, padding: '1px 6px' }}>{im.escolhaLabel}</span>
          <span style={{ color: '#8fa1b2', fontSize: 11 }}>{im.mensalFmt}</span>
        </div>
        <div style={{ color: '#6b7c8c', fontSize: 11, marginTop: 2, maxWidth: 460 }}>{im.dica}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: '#6b7c8c', fontSize: 10, letterSpacing: 1 }}>IMÓVEL</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: im.varImovelCor }}>{im.varImovelFmt}</div>
      </div>
      <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid #142638', paddingTop: 9 }}>
        <div>
          <div style={{ color: '#6b7c8c', fontSize: 10, letterSpacing: 1 }}>🏠 {im.tijoloTag}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: im.tijoloCor }}>{im.tijoloFmt}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#6b7c8c', fontSize: 10, letterSpacing: 1 }}>📈 {im.carteiraTag}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: im.carteiraCor }}>{im.carteiraFmt}</div>
        </div>
      </div>
    </div>
  );
}
