import type { Gender, Person } from '../model/person';

// ── Arrays: map, filter, reduce ──────────────────────────────────────────────

/** The number of people. */
export const getLength = (people: readonly Person[]): number => people.length;

/** How many people are male. */
export const countMales = (people: readonly Person[]): number =>
  people.filter(({ gender }) => gender === 'male').length;

/** The names, in order. Destructuring in the parameter list (ES2015). */
export const getNames = (people: readonly Person[]): string[] => people.map(({ name }) => name);

/**
 * A curried arrow function: `getAttr('name')` returns a function, reusable for
 * any list. The return type follows the key — `Person['height'][]` for 'height'.
 */
export const getAttr =
  <K extends keyof Person>(attr: K) =>
  (people: readonly Person[]): Person[K][] =>
    people.map((person) => person[attr]);

/** The keys of the first person, or null for an empty list. */
export const getFirstKeys = (people: readonly Person[]): string[] | null => {
  // `at(0)` is typed `Person | undefined`: the compiler knows the list may be
  // empty, where `people[0]` pretends it never is.
  const first = people.at(0);
  return first === undefined ? null : Object.keys(first);
};

/** `"key: value"` for every field of the last person, or null for an empty list. */
export const describeLast = (people: readonly Person[]): string[] | null => {
  // `at(-1)` (ES2022) instead of `people[people.length - 1]`.
  const last = people.at(-1);
  if (!last) return null;
  return Object.entries(last).map(([key, value]) => `${key}: ${value}`);
};

/** The average mass, or null when the list is empty or one mass is unknown. */
export const getMassAverage = (people: readonly Person[]): number | null => {
  if (people.length === 0) return null;
  const masses = people.map(({ mass }) => Number(mass));
  if (masses.some(Number.isNaN)) return null;
  return masses.reduce((sum, mass) => sum + mass, 0) / masses.length;
};

/** The numeric fields of the last person (but its id), each one plus one. */
export const addOneToLast = (people: readonly Person[]): Partial<Person> => {
  const last = people.at(-1);
  if (!last) return {};
  // entries → filter → map → fromEntries (ES2019): an object transformed like an array.
  return Object.fromEntries(
    Object.entries(last)
      .filter(([key, value]) => key !== 'id' && typeof value === 'string' && !Number.isNaN(Number(value)))
      .map(([key, value]) => [key, String(Number(value) + 1)]),
  );
};

/** The distinct eye colours, in order of first appearance. A Set dedupes (ES2015). */
export const uniqueEyeColors = (people: readonly Person[]): string[] => [
  ...new Set(people.map(({ eyeColor }) => eyeColor ?? 'unknown')),
];

// ── Newer built-ins: groupBy, toSorted, structuredClone ──────────────────────

/** The people grouped by gender — `Object.groupBy` (ES2024). */
export const groupByGender = (people: readonly Person[]): Partial<Record<Gender | 'unknown', Person[]>> =>
  Object.groupBy(people, ({ gender }) => gender ?? 'unknown');

/** A copy sorted by height, tallest first, unknown heights last. */
export const sortByHeight = (people: readonly Person[]): Person[] => {
  const height = ({ height }: Person) => Number(height ?? Number.NaN);
  // `toSorted` (ES2023) returns a new array: `sort` would mutate the caller's.
  return people.toSorted((a, b) => {
    if (Number.isNaN(height(a))) return 1;
    if (Number.isNaN(height(b))) return -1;
    return height(b) - height(a);
  });
};

/** A deep copy: nested arrays are copied too, unlike with a spread. */
export const deepCopy = <T>(value: T): T => structuredClone(value);

// ── Objects: rest, spread, optional chaining, nullish coalescing ─────────────

/** The person without its films — rest in a destructuring (ES2018). */
export const withoutFilms = ({ films: _films, ...rest }: Person): Omit<Person, 'films'> => rest;

const defaults = { films: [], gender: 'n/a' } satisfies Partial<Person>;

/** A full person from the required fields: the defaults, overridden by what is given. */
export const withDefaults = (person: Pick<Person, 'id' | 'name'> & Partial<Person>): Person => ({
  ...defaults,
  ...person,
});

/** A copy of the person with one more film — never mutating the original. */
export const addFilm = (person: Person, film: string): Person => ({
  ...person,
  films: [...person.films, film],
});

/**
 * The mass of a person who may be missing. `??` only falls back on null and
 * undefined: an empty string is kept, where `||` would have replaced it.
 */
export const describeMass = (person?: Person): string => person?.mass ?? 'unknown';
