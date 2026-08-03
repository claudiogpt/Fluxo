// Renderizador de markdown POBRE, de propósito: `## título`, parágrafo, item
// de lista e `**forte**`. Nada mais.
//
// Por que não uma lib: o único autor do markdown deste app sou eu, em
// src/conteudo — não é entrada de usuário. Uma lib de markdown aqui traria
// parser, sanitização e 40 kB pra renderizar quatro construções que cabem em
// trinta linhas. Se um dia o conteúdo vier de fora, isto vira insuficiente na
// hora certa: sem `dangerouslySetInnerHTML`, texto é sempre texto.
//
// Duas variantes. `compacta` é a de sempre, do overlay sobre a mesa. `prosa` é
// a do fichário: serifada, 17px, e com uma regra a mais — lista cujos itens
// começam com `**Título.** resto` vira grade de destaques em vez de bullets.
// Essa forma não foi inventada pro design: é como o manual já estava escrito.
import type { CSSProperties, ReactNode } from 'react';

export type VarianteMarkdown = 'compacta' | 'prosa';

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

/** `**Título.** resto` → as duas metades. `null` quando o item não tem essa
 *  forma — basta um item fora do padrão pra lista inteira voltar a ser lista. */
function partirDestaque(item: string): { titulo: string; resto: string } | null {
  const m = /^\*\*(.+?)\*\*\s*(.*)$/s.exec(item);
  if (!m) return null;
  return { titulo: m[1].trim(), resto: m[2].replace(/^[—-]\s*/, '').trim() };
}

const h: CSSProperties = {
  color: 'var(--texto-forte)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 1,
  margin: '22px 0 8px',
};
const p: CSSProperties = { margin: '0 0 12px', color: 'var(--texto-fraco)' };

// A variante de prosa: serifada e maior. O rótulo continua em mono — é
// exatamente a divisão que o design pede (explicação × dado).
const hProsa: CSSProperties = {
  color: 'var(--texto-rotulo)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 2,
  textTransform: 'uppercase',
  margin: '28px 0 10px',
};
const pProsa: CSSProperties = {
  margin: '0 0 14px',
  color: 'var(--texto-fraco)',
  fontFamily: 'var(--fonte-prosa)',
  fontSize: 17,
  lineHeight: 1.45,
};

export function Markdown({
  corpo,
  variante = 'compacta',
}: {
  corpo: string;
  variante?: VarianteMarkdown;
}) {
  const prosa = variante === 'prosa';
  const estiloH = prosa ? hProsa : h;
  const estiloP = prosa ? pProsa : p;

  // Blocos separados por linha em branco; dentro do bloco, quebra simples é
  // continuação do parágrafo (o texto-fonte é quebrado por largura de coluna).
  const blocos = corpo.trim().split(/\n\s*\n/);

  return (
    <div style={prosa ? undefined : { fontSize: 12.5, lineHeight: 1.65 }}>
      {blocos.map((bloco, i) => {
        if (bloco.startsWith('## ')) {
          return (
            <h4 key={i} style={estiloH}>
              {bloco.slice(3).trim()}
            </h4>
          );
        }
        if (bloco.trimStart().startsWith('- ')) {
          const itens = bloco
            .split(/\n(?=\s*- )/)
            .map((l) => l.trim().replace(/^- /, '').replace(/\s*\n\s*/g, ' '));

          // Grade de destaques: só quando TODO item tem a forma, senão a lista
          // sairia meio grade, meio bullet.
          const destaques = itens.map(partirDestaque);
          if (prosa && itens.length > 1 && destaques.every((d) => d && d.resto)) {
            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 14,
                  margin: '0 0 20px',
                }}
              >
                {destaques.map((d, j) => (
                  <div key={j}>
                    <div
                      style={{
                        color: 'var(--texto-forte)',
                        fontSize: 14,
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {d!.titulo}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--fonte-prosa)',
                        fontSize: 17,
                        lineHeight: 1.45,
                        color: 'var(--texto-fraco)',
                      }}
                    >
                      {comForte(d!.resto)}
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <ul key={i} style={{ ...estiloP, paddingLeft: 18 }}>
              {itens.map((item, j) => (
                <li key={j} style={{ marginBottom: 6 }}>
                  {comForte(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={estiloP}>
            {comForte(bloco.replace(/\s*\n\s*/g, ' '))}
          </p>
        );
      })}
    </div>
  );
}
