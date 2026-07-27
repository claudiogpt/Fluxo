// As 4 regras do clássico — a explicação que recebe quem chega.
import { REGRAS } from '../../features/ui/textos';

export function RegrasCard() {
  return (
    <div
      style={{
        border: '1px solid var(--borda)',
        background: 'var(--superficie-2)',
        borderRadius: 6,
        padding: '20px 22px',
        marginBottom: 28,
        display: 'grid',
        gap: 10,
      }}
    >
      {REGRAS.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          <span style={{ color: 'var(--sucesso)' }}>{String(i + 1).padStart(2, '0')}</span>
          <span>{r}</span>
        </div>
      ))}
    </div>
  );
}
