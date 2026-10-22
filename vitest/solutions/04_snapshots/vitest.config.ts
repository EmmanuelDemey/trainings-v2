import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Every line and every branch must be run by a test: what makes
      // `npm test` the judge of this workshop.
      thresholds: { 100: true },
    },
  },
});
