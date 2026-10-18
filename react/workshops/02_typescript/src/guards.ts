import type { Person } from './model/person';

// TODO 4.1: make this a type guard (`value is Person`), and check every field
//           of Person: `id` and `name` are strings, `films` is an array of
//           strings, and each optional field is either missing or a string.
export function isPerson(_value: unknown): boolean {
  return false;
}

// TODO 4.2: throw a TypeError when the payload is not an array, and otherwise
//           keep only the items that are people — `filter(isPerson)`.
export function parsePeople(_payload: unknown): Person[] {
  return [];
}
