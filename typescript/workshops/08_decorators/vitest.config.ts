import { transform } from 'esbuild';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vite's default transform (oxc) only lowers the legacy decorators: esbuild
  // lowers the standard ones, which no JavaScript engine runs natively yet.
  oxc: false,
  plugins: [
    {
      name: 'esbuild-decorators',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.endsWith('.ts')) return;
        const result = await transform(code, { loader: 'ts', target: 'es2022', sourcemap: true, sourcefile: id });
        return { code: result.code, map: result.map };
      },
    },
  ],
  test: {
    include: ['tests/**/*.spec.ts'],
  },
});
