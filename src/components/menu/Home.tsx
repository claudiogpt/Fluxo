// Landing: recebe o jogador, explica o clássico e oferece os caminhos.
// Os botões vêm de ITENS_HOME — acrescentar um é editar aquela lista.
import { useDispatch, useSelector } from 'react-redux';
import { selectContador } from '../../features/conceitos/conceitosSlice';
import { ITENS_HOME } from '../../features/ui/menuItens';
import { irPara } from '../../features/ui/uiSlice';
import type { AppDispatch } from '../../store';
import { BotaoMenu } from './BotaoMenu';
import { MenuLayout } from './MenuLayout';
import { RegrasCard } from './RegrasCard';

export function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const contador = useSelector(selectContador);

  return (
    <MenuLayout>
      {/* Título do design: capitular romana em corpo grande, tracking largo e
          o cursor de terminal piscando. O text-indent compensa o letter-spacing
          da última letra, que senão puxa o bloco visualmente pra esquerda.
          clamp() no lugar dos 66px fixos: em 375px de largura estouraria. */}
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--fonte-titulo)',
          fontSize: 'clamp(38px, 11vw, 66px)',
          fontWeight: 600,
          letterSpacing: '.16em',
          textIndent: '.16em',
          lineHeight: 1,
          color: 'var(--texto-forte)',
        }}
      >
        PECULIUM
        <span
          aria-hidden="true"
          style={{ color: 'var(--sucesso)', animation: 'piscar 1.1s steps(1,end) infinite' }}
        >
          _
        </span>
      </h1>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, margin: '18px 0 26px' }}>
        <span style={{ color: 'var(--texto-fraco)', fontSize: 12, letterSpacing: 5 }}>
          FLUXO&nbsp;FINANCEIRO
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--borda)', display: 'block' }} />
        <span style={{ color: 'var(--texto-apagado)', fontSize: 11, letterSpacing: 2 }}>
          RISCO REAL
        </span>
      </div>
      <p style={{ color: 'var(--texto-fraco)', margin: '0 0 28px', maxWidth: 520 }}>
        Cada turno é um mês. Seu custo de vida drena a conta. Se o dinheiro acabar,{' '}
        <span style={{ color: 'var(--perigo)', fontWeight: 600 }}>FALIU</span>. Se a renda passiva
        superar o custo de vida, você está{' '}
        <span style={{ color: 'var(--sucesso)', fontWeight: 600 }}>LIVRE</span>.
      </p>

      <RegrasCard />

      <nav style={{ display: 'grid', gap: 10 }} aria-label="Menu principal">
        {ITENS_HOME.map((item) => (
          <BotaoMenu
            key={item.id}
            // o glossário mostra o progresso no lugar da descrição fixa
            item={item.id === 'glossario' ? { ...item, descricao: contador } : item}
            aoClicar={() => dispatch(irPara(item.id))}
          />
        ))}
      </nav>
    </MenuLayout>
  );
}
