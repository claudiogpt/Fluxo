// Cartão de modo/cenário. É um <button> (e não a <div onClick> do protótipo):
// foca com Tab, responde a Enter, é anunciado por leitor de tela, e o
// `disabled` substitui o guard `disponivel &&` que ficava no handler.
import type { CartaoVM } from '../../features/game/selectorsMenu';
import { cartao } from './estilos';

interface Props {
  item: CartaoVM;
  aoEscolher: (id: string) => void;
}

export function CartaoEscolha({ item, aoEscolher }: Props) {
  const ativo = item.disponivel;
  return (
    <button
      type="button"
      disabled={!ativo}
      aria-pressed={item.selecionado}
      onClick={() => aoEscolher(item.id)}
      style={{
        ...cartao,
        borderColor: item.selecionado ? 'var(--sucesso)' : 'var(--borda)',
        cursor: ativo ? 'pointer' : 'default',
      }}
    >
      <span
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 0.5,
            color: ativo ? 'var(--texto-forte)' : 'var(--texto-apagado)',
          }}
        >
          {item.nome}
        </span>
        <span
          style={{
            fontSize: 9,
            letterSpacing: 1,
            flex: 'none',
            color: ativo ? 'var(--sucesso)' : 'var(--texto-apagado)',
          }}
        >
          {item.tag}
        </span>
      </span>
      <span
        style={{
          display: 'block',
          fontSize: 10.5,
          marginTop: 4,
          color: ativo ? 'var(--texto-fraco)' : 'var(--texto-apagado)',
        }}
      >
        {item.descricao}
      </span>
    </button>
  );
}
