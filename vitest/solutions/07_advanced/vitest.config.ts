import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Two runners in one config: `vitest --project unit` runs only the fast one.
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/**/*.unit.spec.ts'],
          // The type-level specs: checked by the compiler, never run.
          typecheck: {
            enabled: true,
            include: ['tests/**/*.test-d.ts'],
            tsconfig: './tsconfig.test.json',
          },
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/**/*.integration.spec.ts'],
          // The integration specs share files on disk: one at a time.
          fileParallelism: false,
        },
      },
    ],
  },
});
