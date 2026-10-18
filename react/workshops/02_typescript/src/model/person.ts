// TODO 1.1: replace `string` with a union of the five genders the data uses:
//           'male' | 'female' | 'hermaphrodite' | 'n/a' | 'none'.
export type Gender = string;

// TODO 1.2: replace this "anything goes" type with the real shape of a person:
//           a required `id` and `name`, the optional measurements and colours
//           (`height`, `mass`, `hairColor`, `skinColor`, `eyeColor`,
//           `birthYear`), an optional `gender`, and the `films` titles.
//           `src/data/people.ts` must still compile, untouched.
export type Person = {
  id: string;
  name: string;
  [field: string]: unknown;
};

// TODO 3.1: derive these four types FROM Person with the utility types —
//           never by copying fields by hand.
/** What a list needs to show a link: the id and the name, nothing else. */
export type PersonPreview = unknown;

/** A person before the server gave it an id. */
export type NewPerson = unknown;

/** The fields an update may change — each one optional, never the id. */
export type PersonPatch = unknown;

/** People indexed by their id. */
export type PeopleById = unknown;

// TODO 3.2: implement the three functions with destructuring and spread.
export function toPreview(_person: Person): PersonPreview {
  return {};
}

export function createPerson(_draft: NewPerson, id: string): Person {
  return { id, name: 'TODO' };
}

export function updatePerson(person: Person, _patch: PersonPatch): Person {
  return person;
}
