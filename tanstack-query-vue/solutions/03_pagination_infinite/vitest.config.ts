import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // The alias of `vite.config.ts` is NOT inherited: Vitest reads this file.
    // The app imports `@/api/fakeApi`, the shared specs `../../api/fakeApi`:
    // both resolve to the same file, so they share ONE fake server.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    // `globals` gives Testing Library the global `afterEach` it needs to
    // unmount every render after each test on its own.
    globals: true,
    include: ['src/**/*.spec.ts'],
  },
});
