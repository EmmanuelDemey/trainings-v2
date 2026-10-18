/// <reference types="cypress" />
import type { Person } from '../../src/model/person.ts';

type NewPerson = Pick<Person, 'name'> & Partial<Omit<Person, 'id' | 'name'>>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Puts the fake API back to its six seeded people. */
      resetApi(): Chainable<void>;
      /** Creates a person through the API — not the UI — and yields it. */
      seedPerson(person: NewPerson): Chainable<Person>;
    }
  }
}

// Set the backend up through the API, not through the UI: it is fast, and a
// test never depends on what the previous one left behind.
Cypress.Commands.add('resetApi', () => {
  cy.request('POST', '/api/reset');
});

Cypress.Commands.add('seedPerson', (person: NewPerson) =>
  cy.request<Person>('POST', '/api/people', person).its('body'),
);

export {};
