import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// App React do Fluxo (index.html → src/main.tsx). O protótipo DC foi
// aposentado no cutover de 2026-07 (vive no git history).
export default defineConfig({
  plugins: [react()],
  build: {
    // Os engine/*.js são UMD (CommonJS + global). No BUILD, o Rollup precisa
    // ser mandado tratá-los como CJS explicitamente (por padrão o plugin só
    // processa node_modules) — sem isso o bundle de produção sai sem o engine.
    // Com isso, o shim usa o export .default (mesmo caminho do Vitest).
    commonjsOptions: {
      include: [/engine\/.*\.js$/, /node_modules/],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Só os testes do app React (Vitest). Os 68 testes do engine seguem no
    // node --test (CommonJS), fora do Vitest.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
