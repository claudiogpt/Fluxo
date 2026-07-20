import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O app React (index.html → src/main.tsx) roda em paralelo ao protótipo DC.
// O Vite serve a raiz do projeto, então "Simulador Financeiro.dc.html" e os
// engine/*.js continuam acessíveis por fetch/script — protótipo intacto.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Só os testes do app React (Vitest). Os 68 testes do engine seguem no
    // node --test (CommonJS), fora do Vitest.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
