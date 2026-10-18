import { delay, http, HttpResponse } from 'msw';
import { people as initialPeople } from '../data/people';
import type { Person } from '../model/person';

/**
 * The fake backend: an in-memory copy of the people, served by MSW both in the
 * browser (`npm run dev`, see `browser.ts`) and in the specs (`node.ts`).
 */
let people: Person[] = structuredClone(initialPeople);
/** Every request the server received, as `GET /api/people/1` — the network tab of the specs. */
let requests: string[] = [];

/** Puts the server back to its initial state — called after each test. */
export function resetDb(): void {
  people = structuredClone(initialPeople);
  requests = [];
}

/** How many times the server received `label`, e.g. `requestsTo('GET /api/people')`. */
export function requestsTo(label: string): number {
  return requests.filter((request) => request === label).length;
}

/** Someone ELSE likes a character: the server changes, this tab knows nothing about it. */
export function likeFromAnotherTab(id: string): void {
  people = people.map((person) => (person.id === id ? { ...person, likes: person.likes + 1 } : person));
}

function log(request: Request): void {
  requests.push(`${request.method} ${new URL(request.url).pathname}`);
}

export const handlers = [
  http.get('/api/people', async ({ request }) => {
    log(request);
    // 5 ms in Node, 100–400 ms in the browser: long enough to SEE the loading states.
    await delay();
    return HttpResponse.json(people);
  }),

  http.get<{ id: string }>('/api/people/:id', async ({ request, params }) => {
    log(request);
    await delay();
    const person = people.find((candidate) => candidate.id === params.id);
    return person ? HttpResponse.json(person) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.post<{ id: string }>('/api/people/:id/like', async ({ request, params }) => {
    log(request);
    await delay();
    const person = people.find((candidate) => candidate.id === params.id);
    if (!person) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const liked = { ...person, likes: person.likes + 1 };
    people = people.map((candidate) => (candidate.id === liked.id ? liked : candidate));
    return HttpResponse.json(liked);
  }),
];
