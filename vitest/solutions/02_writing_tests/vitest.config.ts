import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts'],
      // Every line and every branch of src/ must be run by a test: what makes
      // `npm test` the judge of this workshop.
      thresholds: { 100: true },
    },
  },
});
