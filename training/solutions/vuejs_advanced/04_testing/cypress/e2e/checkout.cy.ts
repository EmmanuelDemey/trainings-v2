/// <reference types="cypress" />

/**
 * STEP 6 — End-to-end.
 *
 * The app answers /api/* in the browser, but a real e2e suite should not depend
 * on that: `cy.intercept` makes the test deterministic and lets us simulate
 * failures the backend would never produce on demand.
 */
describe('Catalog and cart', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/invoices', { fixture: 'invoices.json' }).as('invoices');
    cy.visit('/');
  });

  it('adds products to the cart', () => {
    cy.getByTestId('add-1').click();
    cy.getByTestId('add-2').click();

    // No `cy.wait(1000)`. Assert the state you expect and let Cypress retry the
    // assertion until the DOM catches up — that is what makes it non-flaky.
    cy.getByTestId('cart-count').should('have.text', '2 item(s) in the cart');
  });

  it('shows the invoices returned by the API', () => {
    cy.getByTestId('nav-invoices').click();
    cy.wait('@invoices');

    // FOUR, not three. The fixture deliberately carries one more invoice than
    // the in-browser fake backend, so this number only matches if the
    // interception is really in play. Comment out the `cy.intercept` above and
    // this assertion must go red — if it does not, the test is checking the app
    // against itself.
    cy.getByTestId('invoice-list').find('li').should('have.length', 4);
    cy.contains('Umbrella').should('be.visible');
  });

  it('shows an error when the invoices endpoint fails', () => {
    // Override BEFORE navigating: an interception registered after the request
    // has left never matches.
    cy.intercept('GET', '/api/invoices', { statusCode: 500 }).as('invoicesFail');

    cy.getByTestId('nav-invoices').click();
    cy.wait('@invoicesFail');

    cy.getByTestId('error').should('be.visible').and('contain', '500');

    // Put the happy path back, then retry: this is what proves the button
    // re-issues the request rather than just hiding the alert.
    cy.intercept('GET', '/api/invoices', { fixture: 'invoices.json' }).as('invoicesRetry');
    cy.getByTestId('retry').click();
    cy.wait('@invoicesRetry');

    cy.getByTestId('invoice-list').find('li').should('have.length', 4);
    cy.getByTestId('error').should('not.exist');
  });

  it('signs in and reaches the invoices', () => {
    cy.login('ada@example.com', 'secret');

    cy.visit('/');
    cy.getByTestId('auth-state').should('contain', 'Ada Lovelace');
  });

  /**
   * The second consumer of `cy.login`. Open the Cypress runner and look at the
   * command log: the login form is typed into ONCE, in the test above; here the
   * session is restored from cache in a few milliseconds.
   */
  it('keeps the session across tests without logging in again', () => {
    cy.login('ada@example.com', 'secret');

    cy.visit('/invoices');
    cy.wait('@invoices');
    cy.getByTestId('invoice-list').find('li').should('have.length', 4);
  });
});
