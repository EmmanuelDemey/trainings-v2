import { transform } from 'esbuild';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vite's default transform (oxc) only lowers the legacy decorators: esbuild
  // lowers the standard ones, which no JavaScript engine runs natively yet. It
  // compiles the JSX as well — `jsx: 'automatic'`, what `react-jsx` means in
  // tsconfig.json — so @vitejs/plugin-react, built on oxc, is not used here.
  oxc: false,
  plugins: [
    {
      name: 'esbuild-decorators',
      enforce: 'pre',
      async transform(code, id) {
        if (!/\.tsx?$/.test(id)) return;
        const result = await transform(code, {
          loader: id.endsWith('.tsx') ? 'tsx' : 'ts',
          jsx: 'automatic',
          target: 'es2022',
          sourcemap: true,
          sourcefile: id,
        });
        return { code: result.code, map: result.map };
      },
    },
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.spec.tsx'],
  },
});
