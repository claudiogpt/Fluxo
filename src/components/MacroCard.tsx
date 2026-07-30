// Selic e IPCA do mês — só existe no modo realista, e some sozinho fora dele
// (`if (!m) return null`, o mesmo padrão do NegocioCard e do ImovelCard).
//
// Sem esta faixa a macro viraria magia: o prefixado cairia e o jogador não
// teria como saber por quê.
import { useSelector } from 'react-redux';
import { selectMacro } from '../features/game/selectors';

const rotulo = { color: 'var(--texto-rotulo)', fontSize: 10, letterSpacing: 1 } as const;

export function MacroCard() {
  const m = useSelector(selectMacro);
  if (!m) return null;

  return (
    <div
      style={{
        background: 'var(--superficie-2)', border: '1px solid var(--borda)', borderRadius: 6,
        padding: '12px 16px', display: 'grid', gap: 8, color: 'var(--texto)', fontSize: 13,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
        <div>
          <div style={rotulo}>SELIC</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--texto-forte)' }}>
            {m.selicFmt} <span style={{ fontSize: 12, color: m.selicCor }}>{m.setaSelic}</span>
          </div>
        </div>
        <div>
          <div style={rotulo}>IPCA</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--texto-forte)' }}>{m.ipcaFmt}</div>
        </div>
        <div>
          <div style={rotulo}>JURO REAL</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: m.realCor }}>{m.realFmt}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--texto-rotulo)' }}>{m.ciclo}</div>
    </div>
  );
}
