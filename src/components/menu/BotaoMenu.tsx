// O botão horizontal da home (ícone · rótulo · descrição · seta). Também
// serve a página de CONFIGURAÇÕES, que tem a mesma forma de lista.
import type { ItemMenu } from '../../features/ui/menuItens';

interface Props {
  item: ItemMenu;
  aoClicar: () => void;
}

export function BotaoMenu({ item, aoClicar }: Props) {
  const ativo = item.disponivel;
  return (
    <button
      type="button"
      disabled={!ativo}
      onClick={aoClicar}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        textAlign: 'left',
        background: 'var(--superficie-2)',
        border: '1px solid var(--borda)',
        borderRadius: 6,
        padding: '16px 18px',
        cursor: ativo ? 'pointer' : 'default',
        color: 'inherit',
      }}
    >
      <span
        style={{ color: ativo ? 'var(--sucesso)' : 'var(--texto-apagado)', fontSize: 16, flex: 'none' }}
        aria-hidden="true"
      >
        {item.icone}
      </span>
      <span style={{ flex: 1 }}>
        <span
          style={{
            display: 'block',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            color: ativo ? 'var(--texto-forte)' : 'var(--texto-apagado)',
          }}
        >
          {item.rotulo}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 10.5,
            marginTop: 3,
            color: ativo ? 'var(--texto-fraco)' : 'var(--texto-apagado)',
          }}
        >
          {item.descricao}
        </span>
      </span>
      <span style={{ color: 'var(--texto-apagado)', flex: 'none' }} aria-hidden="true">
        {ativo ? '▸' : 'EM BREVE'}
      </span>
    </button>
  );
}
