// Card de ativo. A alocação é feita pelo ControleAporte (trilho percentual):
// os 8 botões de valor fixo saíram porque a fileira crescia junto com o número
// de ativos, e o percentual não cresce.
import type { AtivoKey } from '../engine/types';
import { type LinhaAtivo } from '../features/game/selectors';
import { ControleAporte } from './ControleAporte';

// Mesma linha nos dois mundos: a lista plana dos 5 clássicos e a subtela de
// categoria do realista produzem o mesmo view-model.
type Linha = LinhaAtivo;

export function AtivoCard({ a }: { a: Linha }) {
  return (
    <div style={{ background: 'var(--superficie-2)', border: '1px solid var(--borda)', borderRadius: 6, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', alignItems: 'center', color: 'var(--texto)', fontSize: 13, lineHeight: 1.5 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--texto-forte)', letterSpacing: 0.5 }}>{a.nome}</span>
          <span style={{ color: 'var(--texto-apagado)', fontSize: 11 }}>{a.ticker}</span>
          <span style={{ fontSize: 10, letterSpacing: 1, color: a.riscoCor, border: `1px solid ${a.riscoCor}`, borderRadius: 3, padding: '1px 6px' }}>{a.riscoLabel}</span>
        </div>
        <div className="dica-curta" style={{ color: 'var(--texto-rotulo)', fontSize: 11, marginTop: 2, maxWidth: 460 }}>
          {a.dica}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--texto-forte)' }}>{a.valorFmt}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: a.varCor }}>{a.varFmt}</div>
        {/* marcação a mercado: o preço de hoje contra o valor no vencimento */}
        {a.curvaNota && <div style={{ fontSize: 10, color: a.curvaCor, marginTop: 2 }}>{a.curvaNota}</div>}
        {/* o imposto ANTES da venda: depois vira constatação, não decisão */}
        {a.irNota && <div style={{ fontSize: 10, color: a.irCor, marginTop: 2 }}>{a.irNota}</div>}
      </div>
      <ControleAporte ativo={a.key as AtivoKey} />
    </div>
  );
}
