// Ajustes da partida do modo/cenário escolhido + INICIAR. Os blocos aparecem
// conforme o que o engine montou (capital só no sandbox, saque só na
// aposentadoria, estratégia só nos imóveis) — um modo novo com ajuste próprio
// entra aqui como mais um bloco condicional.
import { useDispatch, useSelector } from 'react-redux';
import {
  escolherCapital,
  escolherDificuldade,
  escolherEstrategia,
  escolherSaqueModo,
} from '../../features/game/gameSlice';
import { selectSetupPagina } from '../../features/game/selectorsMenu';
import { comecarComConceito } from '../../features/conceitos/thunks';
import { selectNick } from '../../features/placar/placarSlice';
import { irPara } from '../../features/ui/uiSlice';
import type { Dificuldade } from '../../engine/types';
import type { AppDispatch } from '../../store';
import { GrupoOpcoes } from './GrupoOpcoes';
import { MenuLayout } from './MenuLayout';
import { botaoPrimario, dica } from './estilos';

export function PaginaSetup() {
  const cfg = useSelector(selectSetupPagina);
  const nick = useSelector(selectNick);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <MenuLayout titulo={cfg.titulo} descricao={cfg.descricao}>
      <GrupoOpcoes
        titulo="DIFICULDADE"
        grupo={cfg.dificuldade}
        acentoDe={(id) => (id === 'hardcore' ? 'var(--perigo)' : 'var(--sucesso)')}
        aoEscolher={(id) => dispatch(escolherDificuldade(id as Dificuldade))}
      />

      {cfg.capitais && (
        <GrupoOpcoes
          titulo="CAPITAL INICIAL"
          grupo={cfg.capitais}
          aoEscolher={(id) => dispatch(escolherCapital(Number(id)))}
        />
      )}

      {cfg.saque && (
        <GrupoOpcoes
          titulo="MODO DE SAQUE"
          grupo={cfg.saque}
          aoEscolher={(id) => dispatch(escolherSaqueModo(id as 'fixo' | 'percentual'))}
        />
      )}

      {cfg.estrategia && (
        <GrupoOpcoes
          titulo="ESTRATÉGIA DE MORADIA"
          grupo={cfg.estrategia}
          acento="var(--info)"
          aoEscolher={(id) => dispatch(escolherEstrategia(id as 'comprar' | 'alugar'))}
        />
      )}

      <div style={{ height: 8 }} />

      <button style={botaoPrimario} onClick={() => dispatch(comecarComConceito())}>
        INICIAR SIMULAÇÃO ▸
      </button>

      <div style={{ ...dica, marginTop: 14 }}>{cfg.resumo}</div>
      <div style={{ ...dica, marginTop: 6 }}>
        jogando como{' '}
        <button
          onClick={() => dispatch(irPara('perfil'))}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            color: 'var(--sucesso)',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {nick || 'ANÔNIMO'}
        </button>{' '}
        — o placar é global em todos os modos
      </div>
    </MenuLayout>
  );
}
