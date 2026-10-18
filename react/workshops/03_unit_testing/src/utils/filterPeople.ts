import type { Person } from '../model/person';

/** The people whose name contains the query — trimmed, case-insensitive. */
export function filterPeople(people: readonly Person[], query: string): Person[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return [...people];
  return people.filter(({ name }) => name.toLowerCase().includes(needle));
}
