// Landing: recebe o jogador, explica o clássico e oferece os caminhos.
// Os botões vêm de ITENS_HOME — acrescentar um é editar aquela lista.
import { useDispatch } from 'react-redux';
import { ITENS_HOME } from '../../features/ui/menuItens';
import { CHAMADA } from '../../features/ui/textos';
import { irPara } from '../../features/ui/uiSlice';
import type { AppDispatch } from '../../store';
import { BotaoMenu } from './BotaoMenu';
import { MenuLayout } from './MenuLayout';
import { RegrasCard } from './RegrasCard';

export function Home() {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <MenuLayout>
      <div style={{ color: 'var(--sucesso)', fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>
        {CHAMADA}
      </div>
      <h1
        style={{
          fontSize: 42,
          fontWeight: 700,
          margin: '0 0 8px',
          letterSpacing: -1,
          color: 'var(--texto-forte)',
        }}
      >
        FALÊNCIA
        <span style={{ color: 'var(--texto-apagado)' }}> ou </span>
        <span style={{ color: 'var(--sucesso)' }}>LIBERDADE</span>
      </h1>
      <p style={{ color: 'var(--texto-fraco)', margin: '0 0 28px', maxWidth: 520 }}>
        Cada turno é um mês. Seu custo de vida drena a conta. Se o dinheiro acabar,{' '}
        <span style={{ color: 'var(--perigo)', fontWeight: 600 }}>FALIU</span>. Se a renda passiva
        superar o custo de vida, você está{' '}
        <span style={{ color: 'var(--sucesso)', fontWeight: 600 }}>LIVRE</span>.
      </p>

      <RegrasCard />

      <nav style={{ display: 'grid', gap: 10 }} aria-label="Menu principal">
        {ITENS_HOME.map((item) => (
          <BotaoMenu key={item.id} item={item} aoClicar={() => dispatch(irPara(item.id))} />
        ))}
      </nav>
    </MenuLayout>
  );
}
