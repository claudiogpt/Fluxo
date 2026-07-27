// Card da moradia (cenário imóveis): estratégia + corrida contra o fantasma —
// portado 1:1 do ImovelCard do protótipo DC (git history).
import { useSelector } from 'react-redux';
import { selectImovelCard } from '../features/game/selectors';

export function ImovelCard() {
  const im = useSelector(selectImovelCard);
  if (!im) return null;

  return (
    <div style={{ background: 'var(--info-fundo)', border: '1px solid var(--info-borda)', borderRadius: 6, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', alignItems: 'center', color: 'var(--texto)', fontSize: 13, lineHeight: 1.5 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--info)', letterSpacing: 0.5 }}>MORADIA</span>
          <span style={{ fontSize: 10, letterSpacing: 1, color: 'var(--info)', border: '1px solid var(--info)', borderRadius: 3, padding: '1px 6px' }}>{im.escolhaLabel}</span>
          <span style={{ color: 'var(--texto-fraco)', fontSize: 11 }}>{im.mensalFmt}</span>
        </div>
        <div style={{ color: 'var(--texto-rotulo)', fontSize: 11, marginTop: 2, maxWidth: 460 }}>{im.dica}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: 'var(--texto-rotulo)', fontSize: 10, letterSpacing: 1 }}>IMÓVEL</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: im.varImovelCor }}>{im.varImovelFmt}</div>
      </div>
      <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid var(--info-borda-suave)', paddingTop: 9 }}>
        <div>
          <div style={{ color: 'var(--texto-rotulo)', fontSize: 10, letterSpacing: 1 }}>🏠 {im.tijoloTag}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: im.tijoloCor }}>{im.tijoloFmt}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--texto-rotulo)', fontSize: 10, letterSpacing: 1 }}>📈 {im.carteiraTag}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: im.carteiraCor }}>{im.carteiraFmt}</div>
        </div>
      </div>
    </div>
  );
}
