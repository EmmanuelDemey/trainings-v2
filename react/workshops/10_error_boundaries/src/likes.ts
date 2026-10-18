import type { Person } from './model/person';

/**
 * Pretends to save a like. Throws for a Sith Lord — an error thrown from an
 * EVENT HANDLER, which no error boundary will ever see.
 */
export function likePerson(person: Person): void {
  if (person.name.startsWith('Darth ')) {
    throw new Error('You cannot like a Sith Lord');
  }
}
