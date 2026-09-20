import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/**
 * TODO 1: wire the three build-time plugins here.
 *
 *   a) File-based routing. Vue Router 5 ships it: `import VueRouter from
 *      'vue-router/vite'`, with `routesFolder: 'src/pages'`. It MUST come
 *      **before** `vue()` — the Vue plugin has to see the transformed SFC.
 *   b) `unplugin-auto-import/vite` — the `vue` preset, the Vue Router preset,
 *      `dirs: ['src/composables']`, `vueTemplate: true`, and a `dts` path.
 *   c) `unplugin-vue-components/vite` — `dirs: ['src/components']`,
 *      `directoryAsNamespace: true`, and a `dts` path.
 *
 * Then add the three generated `.d.ts` files to `tsconfig.json`'s `include`,
 * and to `.gitignore`: they are build output, not source.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
