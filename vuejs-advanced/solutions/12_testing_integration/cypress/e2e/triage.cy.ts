/// <reference types="cypress" />

/**
 * One journey, in a real browser, against the built app:
 *
 *   npm run build && npm run preview     # http://localhost:4173
 *   npm run e2e                          # or e2e:open
 *
 * Every call the assertions depend on is intercepted and aliased, and every wait
 * is a wait on an alias. There is not one `cy.wait(number)` in this file, and
 * there should never be one in yours: a fixed wait is either flaky or slow,
 * usually both.
 *
 * Note the app hands the network over under Cypress (`main.ts` skips the fake
 * backend when `Cypress` is on `window`). Without that, `cy.intercept` would
 * never see a request — the patch would have answered it first.
 */

describe('triaging the queue', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/tickets', { fixture: 'tickets.json' }).as('tickets');
  });

  it('signs in, reads the queue and opens a ticket', () => {
    cy.signIn();

    cy.visit('/tickets');
    cy.wait('@tickets');

    cy.get('[data-testid="ticket-row"]').should('have.length', 3);
    cy.get('[data-testid="open-count"]').should('contain', '2 open');

    cy.intercept('GET', '/api/tickets/1', {
      body: {
        id: 1,
        subject: 'Card declined on renewal',
        requester: 'ada@northwind.io',
        priority: 'urgent',
        status: 'open',
      },
    }).as('ticket');

    cy.get('[data-testid="ticket-link"]').first().click();
    cy.wait('@ticket');
    cy.get('[data-testid="ticket-subject"]').should('contain', 'Card declined on renewal');
  });

  it('shows the error state when the queue cannot be loaded', () => {
    cy.signIn();

    cy.intercept('GET', '/api/tickets', { statusCode: 500, body: {} }).as('boom');

    cy.visit('/tickets');
    cy.wait('@boom');

    cy.get('[data-testid="error"]').should('be.visible');
    cy.get('[data-testid="ticket-row"]').should('not.exist');
  });
});
