// A lista de termos, sem moldura. Serve os dois donos do glossário:
// o overlay flutuante (durante a partida) e a página do menu.
import { useSelector } from 'react-redux';
import { selectGlossarioLista } from '../features/conceitos/conceitosSlice';

export const RODAPE_GLOSSARIO =
  'termos destravam quando o conceito aparece no jogo — jogue os modos e cenários pra completar';

export function TermosGlossario() {
  const lista = useSelector(selectGlossarioLista);

  return (
    <>
      {lista.map((t) => (
        <div
          key={t.id}
          style={{
            border: '1px solid var(--borda-suave)',
            background: 'var(--fundo)',
            borderRadius: 6,
            padding: '10px 14px',
            display: 'flex',
            gap: 12,
            alignItems: 'baseline',
          }}
        >
          <span style={{ flex: 'none' }} aria-hidden="true">
            {t.icone}
          </span>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 0.5,
                color: t.desbloqueado ? 'var(--texto-forte)' : 'var(--texto-apagado)',
              }}
            >
              {t.nome}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: t.desbloqueado ? 'var(--texto-fraco)' : 'var(--texto-apagado)',
                marginTop: 2,
              }}
            >
              {t.definicao}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
