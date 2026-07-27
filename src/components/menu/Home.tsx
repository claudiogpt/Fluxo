// Landing: recebe o jogador, explica o clássico e oferece os caminhos.
// Os botões vêm de ITENS_HOME — acrescentar um é editar aquela lista.
import { useDispatch } from 'react-redux';
import { ITENS_HOME } from '../../features/ui/menuItens';
import { PECULIUM } from '../../features/ui/textos';
import { irPara } from '../../features/ui/uiSlice';
import type { AppDispatch } from '../../store';
import { BotaoMenu } from './BotaoMenu';
import { MenuLayout } from './MenuLayout';
import { RegrasCard } from './RegrasCard';

export function Home() {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <MenuLayout>
      <h1 style={{ margin: '0 0 10px', fontWeight: 700, color: 'var(--texto-forte)' }}>
        <span
          style={{
            fontFamily: 'var(--fonte-titulo)',
            fontSize: 46,
            letterSpacing: 3,
            display: 'block',
          }}
        >
          PECULIUM
        </span>
        <span style={{ fontSize: 20, letterSpacing: -0.5, color: 'var(--texto-fraco)' }}>
          Fluxo <span style={{ color: 'var(--sucesso)' }}>Financeiro</span>
        </span>
      </h1>
      <p
        style={{
          color: 'var(--texto-rotulo)',
          fontSize: 12,
          margin: '0 0 20px',
          maxWidth: 520,
          borderLeft: '2px solid var(--borda)',
          paddingLeft: 12,
        }}
      >
        {PECULIUM}
      </p>
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
