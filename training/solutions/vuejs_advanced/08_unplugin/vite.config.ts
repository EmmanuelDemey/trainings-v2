import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import VueRouter from 'vue-router/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    // Before `vue()`, always: the Vue plugin has to see the transformed SFC.
    VueRouter({ routesFolder: 'src/pages' }),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dirs: ['src/composables'],
      vueTemplate: true,
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['src/components'],
      deep: true,
      directoryAsNamespace: true,
      dts: 'src/components.d.ts',
    }),
    vue(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
