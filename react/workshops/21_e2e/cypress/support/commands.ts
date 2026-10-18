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

Cypress.Commands.add('resetApi', () => {
  // TODO 2.1: POST /api/reset with `cy.request` — the fake API puts its six
  // seeded people back.
  throw new Error('TODO 2.1');
});

Cypress.Commands.add('seedPerson', (person: NewPerson) => {
  // TODO 2.2: POST the person to /api/people with `cy.request`, and yield the
  // created person (the response body) with `.its('body')`.
  throw new Error(`TODO 2.2 (${person.name})`);
});

export {};
