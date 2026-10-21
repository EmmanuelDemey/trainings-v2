import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    // The type-level specs: checked by the compiler, never run. They live
    // outside tsconfig.json so that `npm run typecheck` stays green on the starter.
    typecheck: { include: ['tests/**/*.test-d.ts'], tsconfig: './tsconfig.test.json' },
  },
});
