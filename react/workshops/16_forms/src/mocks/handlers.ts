import { delay, http, HttpResponse } from 'msw';
import { people as initialPeople } from '../data/people';
import type { Person } from '../model/person';

/**
 * The fake backend: an in-memory copy of the people, served by MSW both in the
 * browser (`npm run dev`, see `browser.ts`) and in the specs (`node.ts`).
 */
let people: Person[] = structuredClone(initialPeople);

/** Puts the "database" back to its initial content — called after each test. */
export function resetDb(): void {
  people = structuredClone(initialPeople);
}

/** What the server currently stores — for the specs to check a person was (not) saved. */
export function storedPeople(): readonly Person[] {
  return people;
}

export const handlers = [
  http.get('/api/people', async () => {
    await delay();
    return HttpResponse.json(people);
  }),

  http.post('/api/people', async ({ request }) => {
    // 5 ms in Node, 100–400 ms in the browser: long enough to SEE the pending state.
    await delay();
    const body = (await request.json()) as Omit<Person, 'id'>;

    // The one rule only the server can check: it is the one holding the data.
    if (people.some((person) => person.name.toLowerCase() === body.name.toLowerCase())) {
      return HttpResponse.json({ message: `${body.name} already exists` }, { status: 409 });
    }

    const person: Person = { ...body, id: String(people.length + 1) };
    people = [...people, person];
    return HttpResponse.json(person, { status: 201 });
  }),
];
