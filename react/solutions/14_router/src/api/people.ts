import type { Person } from '../model/person';

/** `fetch` needs an absolute URL in Node: resolve against the page's origin. */
function apiUrl(path: string): URL {
  return new URL(path, window.location.origin);
}

/** The people whose name contains `q` (all of them when it is empty). */
export async function fetchPeople(q: string, signal?: AbortSignal): Promise<Person[]> {
  const url = apiUrl('/api/people');
  if (q) url.searchParams.set('q', q);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Could not load the people (HTTP ${response.status})`);
  return (await response.json()) as Person[];
}

/** The person with this id, or `null` when the API does not know it. */
export async function fetchPerson(id: string, signal?: AbortSignal): Promise<Person | null> {
  const response = await fetch(apiUrl(`/api/people/${id}`), { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Could not load person ${id} (HTTP ${response.status})`);
  return (await response.json()) as Person;
}
