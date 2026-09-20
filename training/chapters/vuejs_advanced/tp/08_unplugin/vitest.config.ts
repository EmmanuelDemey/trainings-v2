import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

/**
 * TODO 2: Vitest reads THIS file, not `vite.config.ts` — the plugins do not come
 *   for free. Wire the same three here, or the specs will never see a generated
 *   route. (Worth knowing: `mergeConfig` from `vite` can share one list between
 *   the two files. Do it once you have them working.)
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.spec.ts'],
  },
});
