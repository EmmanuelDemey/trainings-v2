/// <reference types="cypress" />

/**
 * The login, once, for every spec.
 *
 * Two things make it reliable: the request is **intercepted and aliased**, so
 * `cy.wait('@session')` waits for the thing that actually has to finish, and
 * `cy.session` caches the result — the second spec restores it instead of
 * driving the form again.
 */
declare global {
  namespace Cypress {
    interface Chainable {
      signIn(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('signIn', () => {
  cy.session('agent', () => {
    cy.intercept('POST', '/api/session', {
      statusCode: 200,
      body: { token: 'token-1', agent: { id: 1, name: 'Ada Lovelace' } },
    }).as('session');

    cy.visit('/login');
    cy.get('[data-testid="email"]').type('ada@acme.dev');
    cy.get('[data-testid="password"]').type('secret');
    cy.get('[data-testid="login-form"]').submit();

    cy.wait('@session');
    cy.get('[data-testid="agent-name"]').should('contain', 'Ada Lovelace');
  });
});

export {};
