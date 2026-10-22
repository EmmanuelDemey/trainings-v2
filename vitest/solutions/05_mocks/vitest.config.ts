import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Replaced by a mock in every spec: what it does is never run.
      exclude: ['src/catalog-api.ts', 'src/__mocks__/**'],
      // Every line and every branch must be run by a test: what makes
      // `npm test` the judge of this workshop.
      thresholds: { 100: true },
    },
    // Every vi.fn and vi.spyOn starts each test fresh: no call leaks from one
    // test into the next.
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
  },
});
