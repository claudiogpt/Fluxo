import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { conceitos } from './engine';
import { Glossario } from './components/Glossario';
import {
  marcarVisto,
  selectContador,
  selectVistos,
} from './features/conceitos/conceitosSlice';
import type { AppDispatch } from './store';

// PASSO 1 — shell mínimo que prova o bridge do engine UMD → React/TS.
// PASSO 2 — bloco vivo do conceitosSlice (contador reativo + persistência).
export function App() {
  const totalTermos = Object.keys(conceitos.termos).length;
  const totalTooltips = Object.keys(conceitos.tooltips).length;
  const exemplo = conceitos.termos.volatilidade;
  const dispatch = useDispatch<AppDispatch>();
  const contador = useSelector(selectContador);
  const vistos = useSelector(selectVistos);
  const proximoTooltip = Object.keys(conceitos.tooltips).find((id) => !vistos.includes(id));

  // PASSO 3 — Glossário: [G] abre/fecha, [ESC] fecha (guard pra inputs,
  // espelhando o comportamento do orquestrador DC).
  const [glossarioAberto, setGlossarioAberto] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && /^(INPUT|TEXTAREA)$/.test(alvo.tagName)) return;
      // e.code (tecla física) OU e.key (caractere): eventos sintéticos e
      // teclados não-QWERTY nem sempre trazem os dois.
      if (e.code === 'KeyG' || e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setGlossarioAberto((aberto) => !aberto);
      } else if (e.code === 'Escape' || e.key === 'Escape') {
        e.preventDefault();
        setGlossarioAberto(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0f14',
        color: '#d7e1ea',
        fontFamily: "'IBM Plex Mono', monospace",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <div style={{ color: '#22d47e', fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>
          FLUXO // MIGRAÇÃO REACT — PASSO 1
        </div>
        <h1 style={{ fontSize: 28, margin: '0 0 16px', color: '#f2f7fb' }}>
          Bridge do engine ✓
        </h1>
        <p style={{ color: '#8fa1b2', lineHeight: 1.6 }}>
          O engine UMD carregou via <code>src/engine</code>:{' '}
          <strong style={{ color: '#22d47e' }}>{totalTermos} termos</strong> e{' '}
          <strong style={{ color: '#22d47e' }}>{totalTooltips} tooltips</strong> no dicionário
          de conceitos.
        </p>
        <div
          style={{
            border: '1px solid #1e2833',
            background: '#0d1117',
            borderRadius: 6,
            padding: '12px 16px',
            marginTop: 16,
            fontSize: 13,
          }}
        >
          <div style={{ color: '#f2f7fb', fontWeight: 700 }}>{exemplo.nome}</div>
          <div style={{ color: '#8fa1b2', marginTop: 4 }}>{exemplo.definicao}</div>
        </div>

        <div
          style={{
            border: '1px solid #1e2833',
            background: '#11161d',
            borderRadius: 6,
            padding: '12px 16px',
            marginTop: 16,
            fontSize: 13,
          }}
        >
          <div style={{ color: '#6b7c8c', fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>
            PASSO 2 — STORE DE CONCEITOS (REATIVO + PERSISTENTE)
          </div>
          <div style={{ color: '#22d47e', fontWeight: 700 }}>📖 {contador}</div>
          <div style={{ color: '#8fa1b2', marginTop: 4, fontSize: 11.5 }}>
            tooltips vistos: {vistos.length ? vistos.join(', ') : 'nenhum'}
          </div>
          <button
            onClick={() => proximoTooltip && dispatch(marcarVisto(proximoTooltip))}
            disabled={!proximoTooltip}
            style={{
              marginTop: 10,
              background: proximoTooltip ? '#22d47e' : '#1e2833',
              color: proximoTooltip ? '#08110c' : '#3a4a5a',
              border: 'none',
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1,
              padding: '8px 14px',
              borderRadius: 4,
              cursor: proximoTooltip ? 'pointer' : 'default',
            }}
          >
            {proximoTooltip
              ? `SIMULAR TOOLTIP VISTO ▸ ${proximoTooltip}`
              : 'TODOS OS TOOLTIPS VISTOS ✓'}
          </button>
          <div style={{ color: '#3a4a5a', marginTop: 8, fontSize: 10.5 }}>
            grava em localStorage["{conceitos.CHAVE}"] — a mesma chave do protótipo; recarregue
            pra ver persistir.
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 70 }}>
        <button
          onClick={() => setGlossarioAberto((aberto) => !aberto)}
          style={{
            background: '#0d1117',
            border: '1px solid #1e2833',
            color: '#8fa1b2',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.5,
            padding: '8px 14px',
            borderRadius: 20,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,.5)',
          }}
        >
          📖 {contador} [G]
        </button>
      </div>

      {glossarioAberto && <Glossario fechar={() => setGlossarioAberto(false)} />}
    </div>
  );
}
