// Duas guardas de tema. Falham cedo em vez de deixar a regressão aparecer
// como texto invisível — que no tema escuro ninguém percebe.
// Os arquivos entram por import.meta.glob (Vite) em vez de fs: sem precisar
// de @types/node e sem depender do diretório de trabalho do runner.
import { describe, expect, it } from 'vitest';
import { MAPA_COR_ENGINE, corDoEngine } from './cores';

// duas: a global é pra .match (colher todas), a simples é pra .test — com a
// flag /g o .test guarda lastIndex entre chamadas e pularia arquivos.
const HEX = /#[0-9a-fA-F]{3,8}/g;
const TEM_HEX = /#[0-9a-fA-F]{3,8}/;

const fontesEngine = import.meta.glob('/engine/*.js', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const fontesApp = import.meta.glob('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('cores do engine', () => {
  it('toda cor que o engine emite tem token correspondente', () => {
    const emitidas = new Set<string>();
    for (const codigo of Object.values(fontesEngine)) {
      for (const cor of codigo.match(HEX) ?? []) emitidas.add(cor.toLowerCase());
    }
    expect(emitidas.size).toBeGreaterThan(0); // o teste está mesmo lendo o engine
    const semToken = [...emitidas].filter((c) => !(c in MAPA_COR_ENGINE));
    expect(semToken, 'adicione estas cores ao MAPA_COR_ENGINE').toEqual([]);
  });

  it('cor desconhecida passa direto em vez de sumir', () => {
    expect(corDoEngine('#abcdef')).toBe('#abcdef');
    expect(corDoEngine('#22D47E')).toBe('var(--sucesso)'); // case-insensitive
  });
});

describe('guarda de tokens', () => {
  it('nenhuma cor literal no src fora do cores.ts', () => {
    const infratores = Object.entries(fontesApp)
      .filter(([caminho]) => !caminho.endsWith('/cores.ts') && !/\.test\.tsx?$/.test(caminho))
      .filter(([, codigo]) => TEM_HEX.test(codigo))
      .map(([caminho]) => caminho);
    expect(infratores, 'use var(--token) do tema.css em vez de hex').toEqual([]);
  });
});
