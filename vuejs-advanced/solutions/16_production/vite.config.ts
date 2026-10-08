import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    vue(),

    // Behind a guard, so `npm run build` stays fast and CI does not try to open
    // a browser. `npm run analyze` sets ANALYZE=1.
    //
    // What the treemap shows on this app, biggest first:
    //   1. `@vue/runtime-core` — the framework itself, ~60 kB raw
    //   2. `vue-router` — ~25 kB
    //   3. our own views + `heavyReport`
    //
    // And the lesson hiding in third place: `heavyReport` LOOKS heavy (4 000
    // rows) but its chunk is under 1 kB, because that table is GENERATED at
    // runtime by an `Array.from`. Bundle size is source size, not memory
    // footprint — which is exactly why you read the treemap instead of guessing.
    // Its cost is real at runtime, and splitting it out still wins: nobody who
    // never clicks Export pays for parsing and running it.
    ...(process.env.ANALYZE
      ? [visualizer({ open: false, gzipSize: true, brotliSize: true, filename: 'stats.html' })]
      : []),
  ],

  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },

  build: {
    // Report gzipped sizes in the build output — the number that matters.
    reportCompressedSize: true,

    rollupOptions: {
      output: {
        /**
         * STEP 3 — one chunk for the framework.
         *
         * Did the TOTAL size go up? Yes, by a few hundred bytes: an extra chunk
         * means an extra entry in the manifest, an extra module wrapper, and
         * fewer cross-module optimisations for Rollup to make.
         *
         * Is it worth it here? Yes — but for a reason that has nothing to do
         * with size. `vue` + `vue-router` + `pinia` change when you upgrade
         * them, roughly never; your app code changes on every deploy. Split
         * apart, a deploy invalidates ~50 kB instead of ~150 kB, and returning
         * users re-download only what actually changed.
         *
         * When it is NOT worth it: a low-traffic internal app where nobody makes
         * a second visit before the next deploy (the cache never gets a chance
         * to pay off), or an app small enough that the whole bundle is under
         * ~30 kB gzipped (an extra round trip costs more than the re-download).
         */
        // NOTE — Vite 8 bundles with Rolldown, which only accepts the FUNCTION
        // form of `manualChunks`. The `{ vue: ['vue', 'vue-router'] }` object
        // form you will find in most articles (and in Vite <= 7) fails at build
        // time with `TypeError: manualChunks is not a function`.
        manualChunks(id: string) {
          if (/node_modules[\\/](@vue[\\/]|vue[\\/]|vue-router[\\/]|pinia[\\/])/.test(id)) {
            return 'vue';
          }
          return undefined;
        },
      },
    },
  },

  // Strips the production devtools hook and the hydration-mismatch messages —
  // a few kB, and one fewer thing exposing your component tree in production.
  define: {
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
});
