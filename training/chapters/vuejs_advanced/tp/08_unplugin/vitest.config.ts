import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

/**
 * Vitest reads THIS file, not `vite.config.ts` — the plugins do not come for
 * free. Rather than keeping two lists in sync, merge the one that already
 * exists: the specs then see the same generated routes, auto-imports and
 * components as the app.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['tests/**/*.spec.ts'],
    },
  }),
);
