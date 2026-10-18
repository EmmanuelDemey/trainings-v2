import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // `npm run dev` serves the app — and its fake API — here. Every
    // `cy.visit('/…')` and `cy.request('/…')` is relative to it.
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    // Screenshots on failure are enough to debug a run; videos cost time.
    video: false,
  },
});
