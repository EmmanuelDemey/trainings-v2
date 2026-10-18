import type { Person } from '../model/person';

/** The people whose name contains `query`, ignoring case and surrounding spaces. */
export function filterPeople(people: Person[], query: string): Person[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return people;
  return people.filter(({ name }) => name.toLowerCase().includes(needle));
}
