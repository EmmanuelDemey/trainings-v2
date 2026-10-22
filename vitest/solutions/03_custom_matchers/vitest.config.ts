import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    // Runs before every spec file: where the custom matchers are registered.
    setupFiles: ['./tests/setup.ts'],
  },
});
