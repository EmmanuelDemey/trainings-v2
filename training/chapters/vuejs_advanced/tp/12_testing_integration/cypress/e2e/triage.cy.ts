/// <reference types="cypress" />

/**
 * STEP 5 — one end-to-end journey, in a real browser.
 *
 * Run it against the built app:
 *
 *   npm run build && npm run preview     # http://localhost:4173
 *   npm run e2e:open                     # in another terminal
 *
 * The rules that make an e2e suite survive its first month:
 *
 *   - **intercept and alias** every call you depend on, then `cy.wait('@alias')`
 *   - **never** `cy.wait(1000)`: a fixed wait is either flaky or slow, usually both
 *   - assert on what the agent sees, not on the store
 *
 * TODO 5a: the journey — sign in, land on the queue, open a ticket, come back.
 * TODO 5b: close a ticket and assert the row says so.
 * TODO 5c: the unhappy path — a 500 on `GET /api/tickets` shows the error state.
 * TODO 5d: serve the list from `cypress/fixtures/tickets.json` with
 *   `cy.intercept('GET', '/api/tickets', { fixture: 'tickets.json' })`, and say
 *   in the Definition of Done when a fixture beats a live backend.
 */

describe('triaging the queue', () => {
  it('signs in and shows the queue', () => {
    throw new Error('TODO 5a');
  });
});
