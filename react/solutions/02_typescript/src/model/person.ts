// A union of string literals: `gender: 'robot'` is now a compile error.
export type Gender = 'male' | 'female' | 'hermaphrodite' | 'n/a' | 'none';

export type Person = {
  id: string;
  name: string;
  // Optional: the API does not always know them. Reading one gives
  // `string | undefined`, and the compiler makes you handle the `undefined`.
  height?: string;
  mass?: string;
  hairColor?: string;
  skinColor?: string;
  eyeColor?: string;
  birthYear?: string;
  gender?: Gender;
  films: string[];
};

// The utility types derive new types FROM Person: add a field to Person and
// they follow, with nothing to keep in sync by hand.

/** What a list needs to show a link: the id and the name, nothing else. */
export type PersonPreview = Pick<Person, 'id' | 'name'>;

/** A person before the server gave it an id. */
export type NewPerson = Omit<Person, 'id'>;

/** The fields an update may change — each one optional, never the id. */
export type PersonPatch = Partial<NewPerson>;

/** People indexed by their id. */
export type PeopleById = Record<Person['id'], Person>;

export function toPreview({ id, name }: Person): PersonPreview {
  return { id, name };
}

export function createPerson(draft: NewPerson, id: string): Person {
  return { ...draft, id };
}

export function updatePerson(person: Person, patch: PersonPatch): Person {
  // `PersonPatch` has no `id`, so the spread cannot overwrite it.
  return { ...person, ...patch };
}
