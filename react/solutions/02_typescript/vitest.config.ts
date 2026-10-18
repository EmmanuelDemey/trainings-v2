import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // React Testing Library unmounts what it rendered after each test only when
    // it finds a global `afterEach`. The setup file does it explicitly instead,
    // so the specs keep importing `describe` / `it` from 'vitest'.
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    // The `*.test-d.ts` files are never executed: Vitest runs `tsc` on them and
    // reports each type error as a failed test. `expectTypeOf` and
    // `// @ts-expect-error` are the assertions.
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.typetests.json',
    },
  },
});
