// Ajustes da partida do modo/cenário escolhido + INICIAR. Os blocos aparecem
// conforme o que o engine montou (capital só no sandbox, saque só na
// aposentadoria, estratégia só nos imóveis) — um modo novo com ajuste próprio
// entra aqui como mais um bloco condicional.
import { useDispatch, useSelector } from 'react-redux';
import {
  escolherCapital,
  escolherDificuldade,
  escolherEstrategia,
  escolherMacro,
  escolherSaqueModo,
} from '../../features/game/gameSlice';
import { selectSetupPagina } from '../../features/game/selectorsMenu';
import { comecarComConceito } from '../../features/conceitos/thunks';
import { selectNick } from '../../features/placar/placarSlice';
import { irPara } from '../../features/ui/uiSlice';
import type { Dificuldade } from '../../engine/types';
import type { AppDispatch } from '../../store';
import { ESTUDOS } from '../../conteudo';
import { abrirEstudo, selectEstudosDesbloqueados } from '../../features/biblioteca';
import { GrupoOpcoes } from './GrupoOpcoes';
import { MenuLayout } from './MenuLayout';
import { botaoPrimario, dica } from './estilos';

/** A outra ponta da ligação bidirecional: o treino diz o que treina. Enquanto
 *  o estudo não estiver aberto, o nome aparece sem convite — a leitura continua
 *  vindo da experiência, não de um atalho pelo menu. */
function LinkEstudo({ id }: { id: string }) {
  const abertos = useSelector(selectEstudosDesbloqueados);
  const dispatch = useDispatch<AppDispatch>();
  const e = ESTUDOS.find((x) => x.id === id);
  if (!e) return null;
  // Entre aspas porque título de estudo é frase inteira, com ponto final: sem
  // as aspas ele se dissolve no meio da linha do objetivo.
  const titulo = `“${e.titulo.toLowerCase()}”`;
  if (!abertos.includes(id)) return <>{titulo}</>;
  return (
    <button
      onClick={() => {
        dispatch(abrirEstudo(id));
        dispatch(irPara('biblioteca'));
      }}
      style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--sucesso)', cursor: 'pointer' }}
    >
      {titulo} · [L] ler ({e.tempoLeituraMin} min)
    </button>
  );
}

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

      {cfg.macro && (
        <GrupoOpcoes
          titulo="CENÁRIO MACRO"
          grupo={cfg.macro}
          acento="var(--info)"
          aoEscolher={(id) => dispatch(escolherMacro(id as 'alta' | 'baixa'))}
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

      {cfg.treino && (
        <div style={{ ...dica, marginTop: 14 }}>
          objetivo: {cfg.treino.objetivo} · treina{' '}
          <LinkEstudo id={cfg.treino.estudo} />
        </div>
      )}

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
