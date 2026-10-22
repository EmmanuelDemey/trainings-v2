import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    // TODO — Step 3: run tests/setup.ts before every spec file.
  },
});
