/// <reference types="cypress" />

/**
 * STEP 6 — End-to-end.
 *
 * The app answers /api/* in the browser, but a real e2e suite should not depend
 * on that: stub the network with `cy.intercept` so the test is deterministic and
 * so you can simulate failures the backend would never produce on demand.
 */
describe('Catalog and cart', () => {
  beforeEach(() => {
    // TODO 6.3: intercept `GET /api/invoices` with the `invoices.json` fixture
    //   and alias it as `invoices`:
    //     cy.intercept('GET', '/api/invoices', { fixture: 'invoices.json' }).as('invoices');
    cy.visit('/');
  });

  it('adds products to the cart', () => {
    // TODO 6.4: add two products, then assert `cart-count` reads '2 item(s)'.
    //   Never use `cy.wait(1000)` — assert on the state you expect and let
    //   Cypress retry.
    cy.getByTestId('cart-count').should('exist');
  });

  it('shows the invoices returned by the API', () => {
    cy.getByTestId('nav-invoices').click();

    // TODO 6.5: `cy.wait('@invoices')`, then assert 4 rows are displayed —
    //   the fixture has one more invoice than the real fake backend, which
    //   proves the stub is actually being used.
  });

  it('shows an error when the invoices endpoint fails', () => {
    // TODO 6.6: override the interception with a 500 BEFORE navigating, then
    //   assert the error alert is displayed and that clicking "Retry" re-issues
    //   the request (intercept again with a success and assert the list appears).
  });

  it('signs in and reaches the invoices', () => {
    // TODO 6.7: once `cy.login` exists (TODO 6.2), use it here and assert the
    //   header shows the signed-in user. Then add a SECOND test using
    //   `cy.login` and check in the Cypress runner that the login flow only ran
    //   once — that is the whole point of `cy.session`.
  });
});
