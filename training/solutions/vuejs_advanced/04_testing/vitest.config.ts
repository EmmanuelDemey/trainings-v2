import { fileURLToPath, URL } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.spec.ts', 'tests/**/*.spec.ts'],
    // The browser mode demo lives in `*.browser.spec.ts` and needs a real
    // browser: it belongs to `vitest.browser.config.ts` only. Without this,
    // Vitest picks it up here and fails with "@vitest/browser/context can be
    // imported only inside the Browser Mode".
    exclude: [...configDefaults.exclude, '**/*.browser.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
    },
  },
});
