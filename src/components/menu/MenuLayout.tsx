// Casca comum de toda tela de menu: coluna centrada, VOLTAR quando há de onde,
// título. Concentrar isso aqui é o que impede seis páginas de repetirem padding.
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPodeVoltar, voltar } from '../../features/ui/uiSlice';
import type { AppDispatch } from '../../store';
import { botaoDiscreto } from './estilos';

interface Props {
  titulo?: string;
  descricao?: string;
  children: ReactNode;
}

export function MenuLayout({ titulo, descricao, children }: Props) {
  const podeVoltar = useSelector(selectPodeVoltar);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        color: 'var(--texto)',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <div style={{ maxWidth: 640, width: '100%' }}>
        {podeVoltar && (
          <button style={{ ...botaoDiscreto, marginBottom: 20 }} onClick={() => dispatch(voltar())}>
            ◂ VOLTAR [ESC]
          </button>
        )}
        {titulo && (
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 0.5,
              margin: '0 0 6px',
              color: 'var(--texto-forte)',
            }}
          >
            {titulo}
          </h2>
        )}
        {descricao && (
          <p style={{ color: 'var(--texto-fraco)', margin: '0 0 24px' }}>{descricao}</p>
        )}
        {children}
      </div>
    </div>
  );
}
