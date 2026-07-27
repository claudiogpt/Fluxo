// Estilos compartilhados das telas de menu. Tudo em token — nenhuma cor
// literal chega aqui (a guarda em cores.test.ts reprova o commit se chegar).
import type { CSSProperties } from 'react';

export const secaoTitulo: CSSProperties = {
  color: 'var(--texto-rotulo)',
  fontSize: 10,
  letterSpacing: 2,
  marginBottom: 8,
};

export const dica: CSSProperties = { color: 'var(--texto-apagado)', fontSize: 11 };

export const cartao: CSSProperties = {
  border: '1px solid var(--borda)',
  background: 'var(--superficie-2)',
  borderRadius: 6,
  padding: '12px 14px',
  textAlign: 'left',
  width: '100%',
  color: 'inherit',
  cursor: 'pointer',
};

export const botaoPrimario: CSSProperties = {
  background: 'var(--sucesso-solido)',
  color: 'var(--sobre-sucesso)',
  border: 'none',
  fontWeight: 700,
  fontSize: 15,
  letterSpacing: 1,
  padding: '14px 32px',
  borderRadius: 4,
  cursor: 'pointer',
};

export const botaoDiscreto: CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--borda)',
  color: 'var(--texto-fraco)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1,
  padding: '6px 12px',
  borderRadius: 4,
  cursor: 'pointer',
};
