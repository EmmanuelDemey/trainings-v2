import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

// No `jsdom` and no `@vitejs/plugin-vue` here on purpose: the only thing this
// workshop has worth unit-testing is `src/config`, which reads `import.meta.env`
// and renders nothing. Everything else is verified by the command it is about —
// `npm run build`, `npm run size`, `npm run verify:serving`.
export default defineConfig({
  resolve: {
    // The alias of `vite.config.ts` is NOT inherited: Vitest reads this file.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.spec.ts'],
  },
});
