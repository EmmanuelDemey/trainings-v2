/// <reference types="cypress" />

/**
 * STEP 6 (PART 2 — chapter 8) — Custom commands.
 *
 * TODO 6.1: implement `getByTestId(id)` so specs stop repeating
 *   `cy.get('[data-testid="..."]')`. One line, used everywhere.
 *
 * TODO 6.2: implement `login(email, password)` with `cy.session`, so the login
 *   round trip runs ONCE for the whole run instead of once per test:
 *
 *   Cypress.Commands.add('login', (email, password) => {
 *     cy.session([email, password], () => {
 *       cy.visit('/login');
 *       cy.getByTestId('email').type(email);
 *       ...
 *       cy.location('pathname').should('eq', '/invoices');
 *     }, { cacheAcrossSpecs: true });
 *   });
 *
 *   Note: this app keeps the session in memory only, so `cy.session` will not
 *   actually restore anything. Make it work by persisting the token in
 *   `localStorage` in the auth store — and explain why `cy.session` needs that.
 */

Cypress.Commands.add('getByTestId', (id: string) => {
  // TODO 6.1
  return cy.get(`[data-testid="${id}"]`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>;
      // TODO 6.2: login(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
