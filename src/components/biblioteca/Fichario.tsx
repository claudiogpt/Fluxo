// A BIBLIOTECA como fichário: estante à esquerda, verbete à direita.
//
// É a casca da PÁGINA (menu → BIBLIOTECA). O overlay que abre sobre a mesa
// durante a partida continua sendo BibliotecaConteudo, compacto de propósito:
// ali a biblioteca é consulta de dez segundos sem sair do jogo, e uma estante
// de 250px sobre o tabuleiro custaria mais tela do que entrega.
//
// As abas são o mesmo 01/02/03 das teclas 1/2/3 — a numeração na tela É o
// atalho, não uma decoração que por acaso combina.
import { useState, type CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PRATELEIRAS,
  abrirPrateleira,
  selectPrateleira,
  selectVerbeteId,
  type Prateleira,
} from '../../features/biblioteca';
import { voltar } from '../../features/ui/uiSlice';
import type { AppDispatch } from '../../store';
import { LateralBiblioteca } from './LateralBiblioteca';
import { Verbete } from './Verbete';

const NOMES: Record<Prateleira, string> = {
  glossario: 'GLOSSÁRIO',
  manual: 'MANUAL',
  fundamentos: 'FUNDAMENTOS',
};

const estilos = {
  // Sem `gap` aqui de propósito: ele muda no estreito, e estilo inline vence
  // media query. Mora em tema.css, junto do resto do layout do fichário.
  abas: {
    display: 'flex',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    borderBottom: '1px solid var(--borda)',
    marginBottom: 18,
  },
  // Longhand em vez de `border`/`borderBottom`: o estado ativo troca só a cor,
  // e misturar shorthand com longhand no mesmo elemento é bug de estilo em
  // rerender (o React avisa, e com razão).
  aba: {
    background: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    color: 'var(--texto-fraco)',
    fontFamily: 'inherit',
    fontSize: 11,
    letterSpacing: 2,
    padding: '0 0 11px',
    cursor: 'pointer',
  },
  abaAtiva: {
    color: 'var(--sucesso)',
    borderBottomColor: 'var(--sucesso-solido)',
    fontWeight: 600,
  },
  num: { marginRight: 6 },
  voltar: {
    background: 'transparent',
    border: '1px solid var(--borda)',
    color: 'var(--texto-fraco)',
    fontFamily: 'inherit',
    fontSize: 11,
    letterSpacing: 1,
    padding: '5px 10px',
    marginBottom: 9,
    cursor: 'pointer',
  },
} satisfies Record<string, CSSProperties>;

export function Fichario() {
  const prateleira = useSelector(selectPrateleira);
  const verbeteId = useSelector(selectVerbeteId);
  const dispatch = useDispatch<AppDispatch>();
  // Só existe no estreito, onde a tela não comporta estante e verbete juntos.
  // É estado de VISTA, não de navegação: por isso mora aqui e não no slice —
  // recarregar a página caindo no índice é o certo, não um bug.
  const [vista, setVista] = useState<'indice' | 'verbete'>('indice');

  return (
    <div className="biblio-fichario" data-vista={vista}>
      <LateralBiblioteca aoEscolher={() => setVista('verbete')} />

      <div className="biblio-abas">
        <div style={estilos.abas} role="tablist" aria-label="Prateleiras da biblioteca">
          {PRATELEIRAS.map((p, i) => (
            <button
              key={p}
              role="tab"
              type="button"
              aria-selected={p === prateleira}
              style={{ ...estilos.aba, ...(p === prateleira ? estilos.abaAtiva : null) }}
              onClick={() => {
                dispatch(abrirPrateleira(p));
                // Trocar de prateleira devolve ao índice: no estreito, cair
                // direto no primeiro verbete de uma aba que você acabou de
                // abrir esconde justamente o que você foi ver.
                setVista('indice');
              }}
            >
              <span style={estilos.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {NOMES[p]}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          {/* Sai da biblioteca, não troca de seção — e não há migalha: a aba
              acesa já diz onde se está. */}
          <button type="button" style={estilos.voltar} onClick={() => dispatch(voltar())}>
            VOLTAR [ESC]
          </button>
        </div>
      </div>

      <Verbete key={`${prateleira}:${verbeteId}`} aoVoltarAoIndice={() => setVista('indice')} />
    </div>
  );
}
