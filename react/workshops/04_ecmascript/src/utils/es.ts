import type { Gender, Person } from '../model/person';

// Every function below is a one-liner or close to it once written with modern
// JavaScript. No `for` loop, no `let`, no mutation of the arguments.

// ── Arrays: map, filter, reduce ──────────────────────────────────────────────

// TODO 1.1: the number of people.
export const getLength = (_people: readonly Person[]): number => 0;

// TODO 1.2: how many people are male — `filter`, destructuring the gender.
export const countMales = (_people: readonly Person[]): number => 0;

// TODO 1.3: the names, in order — `map` with `({ name }) => name`.
export const getNames = (_people: readonly Person[]): string[] => [];

// TODO 1.4: a curried arrow function — `getAttr('name')` returns a function that
//           maps a list of people to that attribute.
export const getAttr =
  <K extends keyof Person>(_attr: K) =>
  (_people: readonly Person[]): Person[K][] =>
    [];

// TODO 2.1: the keys of the first person (`at(0)`, `Object.keys`), or null for an
//           empty list.
export const getFirstKeys = (_people: readonly Person[]): string[] | null => null;

// TODO 2.2: `"key: value"` for every field of the last person (`at(-1)`,
//           `Object.entries`, a template literal), or null for an empty list.
export const describeLast = (_people: readonly Person[]): string[] | null => null;

// TODO 2.3: the average mass (`map` + `reduce`), or null when the list is empty or
//           one mass is unknown.
export const getMassAverage = (_people: readonly Person[]): number | null => 0;

// TODO 2.4: the numeric fields of the last person — its id excepted — each one
//           plus one, still as strings: `Object.entries` → `filter` → `map` →
//           `Object.fromEntries`.
export const addOneToLast = (_people: readonly Person[]): Partial<Person> => ({});

// TODO 2.5: the distinct eye colours, in order of first appearance — a `Set`,
//           spread back into an array.
export const uniqueEyeColors = (_people: readonly Person[]): string[] => [];

// ── Newer built-ins: groupBy, toSorted, structuredClone ──────────────────────

// TODO 3.1: the people grouped by gender with `Object.groupBy` — 'unknown' for
//           the people without one.
export const groupByGender = (_people: readonly Person[]): Partial<Record<Gender | 'unknown', Person[]>> => ({});

// TODO 3.2: a copy sorted by height, tallest first, unknown heights last —
//           `toSorted`, never `sort`.
export const sortByHeight = (people: readonly Person[]): Person[] => [...people];

// TODO 3.3: a deep copy, nested arrays included — `structuredClone`.
export const deepCopy = <T>(value: T): T => value;

// ── Objects: rest, spread, optional chaining, nullish coalescing ─────────────

// TODO 4.1: the person without its films — a rest element in the destructuring
//           of the parameter.
export const withoutFilms = (person: Person): Omit<Person, 'films'> => person;

// TODO 4.2: a full person: `{ films: [], gender: 'n/a' }` as defaults, overridden
//           by whatever is given — two spreads, in the right order.
export const withDefaults = (person: Pick<Person, 'id' | 'name'> & Partial<Person>): Person => ({
  id: person.id,
  name: person.name,
  films: [],
});

// TODO 4.3: a copy of the person with one more film — the original untouched.
export const addFilm = (person: Person, _film: string): Person => person;

// TODO 4.4: the mass of a person who may be missing, 'unknown' when there is
//           none — `?.` and `??`. An empty mass must stay empty.
export const describeMass = (_person?: Person): string => '';
