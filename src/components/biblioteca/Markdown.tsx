// Renderizador de markdown POBRE, de propósito: `## título`, parágrafo, item
// de lista e `**forte**`. Nada mais.
//
// Por que não uma lib: o único autor do markdown deste app sou eu, em
// src/conteudo — não é entrada de usuário. Uma lib de markdown aqui traria
// parser, sanitização e 40 kB pra renderizar quatro construções que cabem em
// trinta linhas. Se um dia o conteúdo vier de fora, isto vira insuficiente na
// hora certa: sem `dangerouslySetInnerHTML`, texto é sempre texto.
import type { CSSProperties, ReactNode } from 'react';

/** `**forte**` → <strong>. Split com grupo de captura: os ímpares são o miolo. */
function comForte(texto: string): ReactNode[] {
  return texto.split(/\*\*(.+?)\*\*/g).map((parte, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ color: 'var(--texto-forte)', fontWeight: 700 }}>
        {parte}
      </strong>
    ) : (
      parte
    )
  );
}

const h: CSSProperties = {
  color: 'var(--texto-forte)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 1,
  margin: '22px 0 8px',
};
const p: CSSProperties = { margin: '0 0 12px', color: 'var(--texto-fraco)' };

export function Markdown({ corpo }: { corpo: string }) {
  // Blocos separados por linha em branco; dentro do bloco, quebra simples é
  // continuação do parágrafo (o texto-fonte é quebrado por largura de coluna).
  const blocos = corpo.trim().split(/\n\s*\n/);

  return (
    <div style={{ fontSize: 12.5, lineHeight: 1.65 }}>
      {blocos.map((bloco, i) => {
        if (bloco.startsWith('## ')) {
          return (
            <h4 key={i} style={h}>
              {bloco.slice(3).trim()}
            </h4>
          );
        }
        if (bloco.trimStart().startsWith('- ')) {
          const itens = bloco.split(/\n(?=\s*- )/).map((l) => l.trim().replace(/^- /, ''));
          return (
            <ul key={i} style={{ ...p, paddingLeft: 18 }}>
              {itens.map((item, j) => (
                <li key={j} style={{ marginBottom: 6 }}>
                  {comForte(item.replace(/\s*\n\s*/g, ' '))}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={p}>
            {comForte(bloco.replace(/\s*\n\s*/g, ' '))}
          </p>
        );
      })}
    </div>
  );
}
