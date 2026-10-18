import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // TODO 1.1: point Cypress at the dev server (`npm run dev`), with
    // `baseUrl`, so that `cy.visit('/')` and `cy.request('/api/…')` need no host.
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    // Screenshots on failure are enough to debug a run; videos cost time.
    video: false,
  },
});
