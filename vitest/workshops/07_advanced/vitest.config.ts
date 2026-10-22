import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // TODO — Step 2: two projects.
    // - `unit`: tests/**/*.unit.spec.ts, plus the type-level specs
    //   (tests/**/*.test-d.ts, checked against ./tsconfig.test.json)
    // - `integration`: tests/**/*.integration.spec.ts, one file at a time
    include: ['tests/**/*.spec.ts'],
  },
});
