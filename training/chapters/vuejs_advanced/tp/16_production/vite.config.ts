import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/**
 * The starting point is the default Vite config: everything in one entry chunk.
 * Run `npm run build` once and write down the sizes before touching anything.
 */
export default defineConfig({
  plugins: [
    vue(),

    // TODO 1.1: add `rollup-plugin-visualizer`, enabled only when ANALYZE=1 so a
    //   normal build stays fast:
    //
    //   ...(process.env.ANALYZE
    //     ? [visualizer({ open: true, gzipSize: true, brotliSize: true, filename: 'stats.html' })]
    //     : []),
    //
    //   Then run `npm run analyze` and identify the three biggest contributors.
  ],

  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },

  build: {
    // Report gzipped sizes in the build output — the number that matters.
    reportCompressedSize: true,

    // TODO 3.1: group the framework into a chunk that rarely changes, so it stays
    //   in the users' cache across deployments:
    //
    //   rollupOptions: {
    //     output: {
    //       manualChunks: { vue: ['vue', 'vue-router', 'pinia'] },
    //     },
    //   },
    //
    // TODO 3.2: rebuild and compare. Did the TOTAL size go up? Explain why, and
    //   say whether the trade-off is worth it here.
  },

  // TODO 5.3: strip the production devtools and hydration-mismatch details:
  //   define: {
  //     __VUE_PROD_DEVTOOLS__: 'false',
  //     __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  //   },
});
