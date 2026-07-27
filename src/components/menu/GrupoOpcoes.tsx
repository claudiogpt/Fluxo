// Segmented control genérico. Substitui o btnToggle(cor,bg) do protótipo e os
// 12 campos de cor que o selector devolvia pra 3 pares de botões — aqui quem
// resolve selecionado/não-selecionado é o componente, com tokens.
// Serve dificuldade, capital, saque, estratégia, tema, fonte e escala.
import type { GrupoVM } from '../../features/game/selectorsMenu';
import { dica as estiloDica, secaoTitulo } from './estilos';

interface Props {
  titulo: string;
  grupo: GrupoVM;
  aoEscolher: (id: string) => void;
  /** cor de destaque do selecionado (o fundo sai dela); padrão: verde */
  acento?: string;
  /** acento por opção — pra HARDCORE ficar vermelho, como no protótipo */
  acentoDe?: (id: string) => string;
}

export function GrupoOpcoes({
  titulo,
  grupo,
  aoEscolher,
  acento = 'var(--sucesso)',
  acentoDe,
}: Props) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={secaoTitulo} id={`grupo-${titulo}`}>
        {titulo}
      </div>
      <div
        role="group"
        aria-labelledby={`grupo-${titulo}`}
        style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
      >
        {grupo.opcoes.map((o) => {
          const sel = o.id === grupo.valor;
          const cor = acentoDe?.(o.id) ?? acento;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={sel}
              onClick={() => aoEscolher(o.id)}
              style={{
                // o fundo deriva do acento, então trocar a cor não exige um
                // token de tint novo pra cada variação
                background: sel ? `color-mix(in srgb, ${cor} 12%, transparent)` : 'transparent',
                border: `1px solid ${sel ? cor : 'var(--texto-rotulo)'}`,
                color: sel ? cor : 'var(--texto-rotulo)',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 1,
                padding: '9px 18px',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {o.rotulo}
            </button>
          );
        })}
        {grupo.dica && <span style={estiloDica}>{grupo.dica}</span>}
      </div>
    </div>
  );
}
