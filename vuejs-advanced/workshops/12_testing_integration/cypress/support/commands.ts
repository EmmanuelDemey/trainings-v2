/// <reference types="cypress" />

/**
 * STEP 4 — the custom command.
 *
 * TODO 4a: `cy.signIn()` should take an agent through the login form once, so no
 *   spec ever repeats those four lines. Intercept `POST /api/session`, fill the
 *   form, and wait on the alias — never on a fixed number of milliseconds.
 *
 * TODO 4b: wrap it in `cy.session('agent', ...)` so the second spec
 *   restores the session instead of logging in again.
 */
declare global {
  namespace Cypress {
    interface Chainable {
      signIn(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('signIn', () => {
  throw new Error('TODO 4a: implement cy.signIn()');
});

export {};
