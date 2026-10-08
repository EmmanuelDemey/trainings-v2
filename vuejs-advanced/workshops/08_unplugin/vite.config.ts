import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/**
 * The three build-time plugins go here, one per step.
 *
 * TODO 1.1: file-based routing. Vue Router 5 ships it: `import VueRouter from
 *   'vue-router/vite'`, with `routesFolder: 'src/pages'`. It MUST come
 *   **before** `vue()` — the Vue plugin has to see the transformed SFC.
 *
 * TODO 2.1: `unplugin-auto-import/vite` — the `vue` preset, the Vue Router
 *   preset, `dirs: ['src/composables']`, `vueTemplate: true`, and a `dts` path.
 *
 * TODO 3.1: `unplugin-vue-components/vite` — `dirs: ['src/components']`,
 *   `directoryAsNamespace: true`, and a `dts` path.
 *
 * `vitest.config.ts` already merges this file: the specs see whatever you add.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
