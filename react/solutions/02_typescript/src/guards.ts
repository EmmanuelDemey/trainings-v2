import type { Person } from './model/person';

const optionalStringFields = [
  'height',
  'mass',
  'hairColor',
  'skinColor',
  'eyeColor',
  'birthYear',
  'gender',
] as const;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

// A type guard: `value is Person` tells the compiler that, when this returns
// true, the `unknown` it received is a Person. The compiler trusts it — the
// checks below are what make that trust deserved.
export function isPerson(value: unknown): value is Person {
  if (typeof value !== 'object' || value === null) return false;
  // `in` narrows the object to one that has the key, typed `unknown`.
  if (!('id' in value) || typeof value.id !== 'string') return false;
  if (!('name' in value) || typeof value.name !== 'string') return false;
  if (!('films' in value) || !isStringArray(value.films)) return false;
  const record = value as Record<string, unknown>;
  return optionalStringFields.every(
    (field) => record[field] === undefined || typeof record[field] === 'string',
  );
}

/** Keeps the valid people of an untrusted payload (`JSON.parse`, `fetch`…). */
export function parsePeople(payload: unknown): Person[] {
  if (!Array.isArray(payload)) {
    throw new TypeError('Expected an array of people');
  }
  // `filter` with a type guard narrows the array too: Person[], not unknown[].
  return payload.filter(isPerson);
}
