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

// `use()` needs the SAME promise on every render: a component that suspends is
// thrown away and rendered again from scratch once the promise settles, so a
// promise created during render would be a new one each time — an endless
// loop of requests. The cache is what makes the promise outlive the render.
const cache = new Map<string, Promise<Person>>();

/** The person's promise, created on the first call and reused afterwards. */
export function getPerson(id: string): Promise<Person> {
  let promise = cache.get(id);
  if (!promise) {
    promise = fetchPerson(id);
    cache.set(id, promise);
  }
  return promise;
}

/**
 * Drops one person from the cache. A rejected promise stays rejected forever:
 * without this, "Try again" would re-read the same failure.
 */
export function forgetPerson(id: string): void {
  cache.delete(id);
}

/** Empties the cache — the specs call it so each test starts cold. */
export function clearPeopleCache(): void {
  cache.clear();
}
