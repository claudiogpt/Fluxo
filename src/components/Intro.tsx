// Menu principal — portado 1:1 do Intro do protótipo DC (git history): modos, dificuldade, capital
// (sandbox), cenários, modo de saque (aposentadoria), estratégia (imóveis) e
// nickname do placar global. Dados de selectIntroConfig; ações via dispatch.
import { useDispatch, useSelector } from 'react-redux';
import { placar } from '../engine';
import { comecarComConceito } from '../features/conceitos/thunks';
import {
  escolherCapital,
  escolherCenario,
  escolherDificuldade,
  escolherEstrategia,
  escolherModo,
  escolherSaqueModo,
} from '../features/game/gameSlice';
import { selectIntroConfig } from '../features/game/selectors';
import { selectNick, setNick } from '../features/placar/placarSlice';
import type { AppDispatch } from '../store';

const mono = "'IBM Plex Mono',monospace";
const secaoTitulo = { color: '#6b7c8c', fontSize: 10, letterSpacing: 2, marginBottom: 8 } as const;
const btnToggle = (cor: string, bg: string) =>
  ({ background: bg, border: `1px solid ${cor}`, color: cor, fontFamily: mono, fontWeight: 700, fontSize: 12, letterSpacing: 1, padding: '9px 18px', borderRadius: 4, cursor: 'pointer' }) as const;

const REGRAS = [
  'Todo mês entra salário e sai custo de vida — e o custo sobe com a inflação.',
  'Aloque o que sobra: reserva, renda fixa, FIIs, ações, cripto. Perfis de risco reais, retornos acelerados — uma vida financeira cabe numa sessão.',
  'Eventos aleatórios ensinam na marra: crash, emergência médica, demissão. Quem tem reserva sobrevive.',
  'Só FIIs, ações e renda fixa geram renda passiva. Cripto não paga aluguel.',
];

export function Intro() {
  const cfg = useSelector(selectIntroConfig);
  const nick = useSelector(selectNick);
  const dispatch = useDispatch<AppDispatch>();
  const online = placar.online();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', color: '#d7e1ea', fontFamily: mono, fontSize: 13, lineHeight: 1.5 }}>
      <div style={{ maxWidth: 640, width: '100%' }}>
        <div style={{ color: '#22d47e', fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>SIMULADOR FINANCEIRO // v1.0</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 8px', letterSpacing: -1, color: '#f2f7fb' }}>
          FALÊNCIA<span style={{ color: '#3a4a5a' }}> ou </span><span style={{ color: '#22d47e' }}>LIBERDADE</span>
        </h1>
        <p style={{ color: '#8fa1b2', margin: '0 0 28px', maxWidth: 520 }}>
          Cada turno é um mês. Seu custo de vida drena a conta. Se o dinheiro acabar,{' '}
          <span style={{ color: '#ff4d5e', fontWeight: 600 }}>FALIU</span>. Se a renda passiva superar o custo de vida, você está{' '}
          <span style={{ color: '#22d47e', fontWeight: 600 }}>LIVRE</span>.
        </p>

        <div style={{ border: '1px solid #1e2833', background: '#11161d', borderRadius: 6, padding: '20px 22px', marginBottom: 28, display: 'grid', gap: 10 }}>
          {REGRAS.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <span style={{ color: '#22d47e' }}>{String(i + 1).padStart(2, '0')}</span>
              <span>{r}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={secaoTitulo}>MODO DE JOGO</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 }}>
            {cfg.modosLista.map((m) => (
              <div
                key={m.id}
                onClick={() => m.disponivel && dispatch(escolherModo(m.id))}
                style={{ border: `1px solid ${m.borda}`, background: '#11161d', borderRadius: 6, padding: '12px 14px', cursor: m.cursor }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.5, color: m.nomeCor }}>{m.nome}</span>
                  <span style={{ fontSize: 9, letterSpacing: 1, color: m.tagCor, flex: 'none' }}>{m.tag}</span>
                </div>
                <div style={{ color: m.descCor, fontSize: 10.5, marginTop: 4 }}>{m.descricao}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={secaoTitulo}>DIFICULDADE</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button style={btnToggle(cfg.normalCor, cfg.normalBg)} onClick={() => dispatch(escolherDificuldade('normal'))}>NORMAL</button>
            <button style={btnToggle(cfg.hardCor, cfg.hardBg)} onClick={() => dispatch(escolherDificuldade('hardcore'))}>HARDCORE</button>
            <span style={{ color: '#3a4a5a', fontSize: 11 }}>{cfg.difDica}</span>
          </div>
        </div>

        {cfg.mostraCapitais && (
          <div style={{ marginBottom: 18 }}>
            <div style={secaoTitulo}>CAPITAL INICIAL</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {cfg.capitaisLista.map((c) => (
                <button key={c.valor} style={btnToggle(c.cor, c.bg)} onClick={() => dispatch(escolherCapital(c.valor))}>
                  {c.rotulo}
                </button>
              ))}
              <span style={{ color: '#3a4a5a', fontSize: 11 }}>com quanto você começa o laboratório</span>
            </div>
          </div>
        )}

        {cfg.mostraCenarios && (
          <div style={{ marginBottom: 18 }}>
            <div style={secaoTitulo}>CENÁRIO</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 }}>
              {cfg.cenariosLista.map((c) => (
                <div
                  key={c.id}
                  onClick={() => c.disponivel && dispatch(escolherCenario(c.id))}
                  style={{ border: `1px solid ${c.borda}`, background: '#11161d', borderRadius: 6, padding: '12px 14px', cursor: c.cursor }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.5, color: c.nomeCor }}>{c.nome}</span>
                    <span style={{ fontSize: 9, letterSpacing: 1, color: c.tagCor, flex: 'none' }}>{c.tag}</span>
                  </div>
                  <div style={{ color: c.descCor, fontSize: 10.5, marginTop: 4 }}>{c.descricao}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cfg.mostraSaqueConfig && (
          <div style={{ marginBottom: 18 }}>
            <div style={secaoTitulo}>MODO DE SAQUE</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button style={btnToggle(cfg.fixoCor, cfg.fixoBg)} onClick={() => dispatch(escolherSaqueModo('fixo'))}>FIXO</button>
              <button style={btnToggle(cfg.pctCor, cfg.pctBg)} onClick={() => dispatch(escolherSaqueModo('percentual'))}>% PATRIMÔNIO</button>
              <span style={{ color: '#3a4a5a', fontSize: 11 }}>{cfg.saqueDica}</span>
            </div>
          </div>
        )}

        {cfg.mostraEstrategia && (
          <div style={{ marginBottom: 18 }}>
            <div style={secaoTitulo}>ESTRATÉGIA DE MORADIA</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button style={btnToggle(cfg.comprarCor, cfg.comprarBg)} onClick={() => dispatch(escolherEstrategia('comprar'))}>🏠 COMPRAR FINANCIADO</button>
              <button style={btnToggle(cfg.alugarCor, cfg.alugarBg)} onClick={() => dispatch(escolherEstrategia('alugar'))}>📈 ALUGAR + INVESTIR</button>
              <span style={{ color: '#3a4a5a', fontSize: 11 }}>{cfg.estrategiaDica}</span>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <div style={secaoTitulo}>PLACAR GLOBAL</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={nick}
              onChange={(e) => dispatch(setNick(e.target.value))}
              maxLength={16}
              placeholder="SEU.NICK"
              spellCheck={false}
              style={{ background: '#11161d', border: '1px solid #1e2833', color: '#f2f7fb', fontFamily: mono, fontWeight: 700, fontSize: 12, letterSpacing: 1, padding: '9px 14px', borderRadius: 4, width: 200, outline: 'none', textTransform: 'uppercase' }}
            />
            <span style={{ color: '#3a4a5a', fontSize: 11 }}>
              {online
                ? 'seu nome no ranking mundial — todos os modos têm placar global'
                : 'placar global desligado — recordes ficam salvos só neste dispositivo'}
            </span>
          </div>
        </div>

        <div style={{ height: 8 }} />

        <button
          onClick={() => dispatch(comecarComConceito())}
          style={{ background: '#22d47e', color: '#08110c', border: 'none', fontFamily: mono, fontWeight: 700, fontSize: 15, letterSpacing: 1, padding: '14px 32px', borderRadius: 4, cursor: 'pointer' }}
        >
          INICIAR SIMULAÇÃO ▸
        </button>
        <div style={{ color: '#3a4a5a', fontSize: 11, marginTop: 14 }}>
          capital inicial {cfg.caixaFmt} · {cfg.rendaResumo} · custo de vida {cfg.custoFmt}/mês
        </div>
      </div>
    </div>
  );
}
