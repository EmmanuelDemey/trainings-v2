import type { Person } from '../model/person';

/** `fetch` needs an absolute URL in Node: resolve against the page's origin. */
function apiUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
}

/** One HTTP request, every time it is called. */
export async function fetchPerson(id: string): Promise<Person> {
  const response = await fetch(apiUrl(`/api/people/${id}`));
  if (!response.ok) {
    throw new Error(`Could not load person ${id} (HTTP ${response.status})`);
  }
  return (await response.json()) as Person;
}

// TODO 2.1: `use()` needs the SAME promise on every render of a component.
//   Keep the promises in a module-level `Map<string, Promise<Person>>`: create
//   the promise on the first call for an id, return the cached one afterwards.
export function getPerson(id: string): Promise<Person> {
  return fetchPerson(id);
}

// TODO 2.2: drop this id from the cache, so that "Try again" sends a new request
//   (a rejected promise stays rejected forever).
export function forgetPerson(id: string): void {}

// TODO 2.1: empty the whole cache — the specs call it before each test.
export function clearPeopleCache(): void {}
