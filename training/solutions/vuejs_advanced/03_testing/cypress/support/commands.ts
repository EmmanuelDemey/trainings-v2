/// <reference types="cypress" />

/**
 * STEP 6 — Custom commands.
 *
 * `getByTestId` exists so specs never grow a CSS selector. A class name is a
 * styling decision and will change; `data-testid` is a contract with the test.
 */
Cypress.Commands.add('getByTestId', (id: string) => {
  return cy.get(`[data-testid="${id}"]`);
});

/**
 * `login` runs the real login flow ONCE per run and replays the resulting
 * browser state afterwards.
 *
 * `cy.session` caches cookies + localStorage + sessionStorage under the given
 * key, so the second test that calls `cy.login` with the same arguments skips
 * the form entirely — you can see it in the runner: the first test shows the
 * login steps, the following ones show a collapsed "session (restored)" group.
 *
 * This only works because `src/stores/auth.ts` persists the session in
 * localStorage. A session held in a Pinia ref lives in the page's JS heap, which
 * `cy.session` neither snapshots nor restores.
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    ['login', email, password],
    () => {
      // The login endpoint has to be stubbed too. With `installFakeBackend()`
      // switched off under Cypress (see `src/main.ts`), nothing answers
      // `POST /api/login` — the e2e suite owns the whole network or none of it.
      cy.intercept('POST', '/api/login', {
        statusCode: 200,
        body: { token: 'token-1', user: { id: 1, name: 'Ada Lovelace' } },
      }).as('login');

      cy.visit('/login');
      cy.getByTestId('email').type(email);
      cy.getByTestId('password').type(password);
      cy.getByTestId('submit').click();
      cy.wait('@login');

      // Wait on the ASSERTION, not on a duration: Cypress retries this until it
      // passes or times out, which is both faster and more reliable than a sleep.
      cy.location('pathname').should('eq', '/invoices');
    },
    {
      cacheAcrossSpecs: true,
      // Runs on every restore: proves the cached state is still usable rather
      // than silently replaying an expired session.
      validate() {
        cy.window().its('localStorage').invoke('getItem', 'tp4:session').should('exist');
      },
    },
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>;
      login(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
