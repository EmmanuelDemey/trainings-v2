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
    // By default Vitest does not compile CSS: a CSS Module import is then a
    // proxy that invents a class name for ANY key — `styles.typo` included. Run
    // the modules (`.module.css` and `.module.scss`) through Vite for real, so
    // a class missing from the stylesheet is `undefined`, and the compiled CSS
    // is injected into the jsdom document.
    css: { include: /\.module\./ },
  },
});
