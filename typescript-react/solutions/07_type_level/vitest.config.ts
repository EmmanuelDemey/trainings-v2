import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.spec.tsx'],
    // The type-level specs: checked by the compiler, never run.
    typecheck: {
      include: ['tests/**/*.test-d.tsx'],
      tsconfig: './tsconfig.test.json',
    },
  },
});
