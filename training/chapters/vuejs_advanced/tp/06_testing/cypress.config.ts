import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Test the BUILT app (`npm run preview`), not the dev server.
    baseUrl: 'http://localhost:4173',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    // Retries in CI only: a test that needs retries locally is a broken test.
    retries: { runMode: 2, openMode: 0 },
  },

  component: {
    devServer: { framework: 'vue', bundler: 'vite' },
  },
});
