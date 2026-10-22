import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/main.ts'],
      // Every line and every branch must be run by a test: what makes
      // `npm test` the judge of this workshop.
      thresholds: { 100: true },
    },
    // TODO — Step 1: a DOM for the components to render into, and
    // tests/setup.ts run before every spec file.
    restoreMocks: true,
  },
});
