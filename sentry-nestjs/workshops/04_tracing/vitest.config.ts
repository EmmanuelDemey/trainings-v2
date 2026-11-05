import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vite's own transform (Oxc) does not emit decorator metadata: Nest needs it to
  // know what to inject. SWC does, with the same options as `tsc` here.
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        target: 'es2023',
      },
    }),
  ],
  test: {
    environment: 'node',
    // Starts the SDK — with your initSentry() and a fake transport — BEFORE the
    // spec imports the app, as `node --import ./dist/instrument.js` does.
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
