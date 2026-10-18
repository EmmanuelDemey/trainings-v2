import type { Person } from '../model/person';

/**
 * Plain `fetch` functions: they know the URLs, nothing about caching. TanStack
 * Query only needs a function returning a promise that REJECTS on failure —
 * which `fetch` does not do on a 404 or a 500, hence the `ok` check.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed with ${response.status}`);
  return (await response.json()) as T;
}

export function fetchPeople(): Promise<Person[]> {
  return request('/api/people');
}

export function fetchPerson(id: string): Promise<Person> {
  return request(`/api/people/${id}`);
}

export function likePerson(id: string): Promise<Person> {
  return request(`/api/people/${id}/like`, { method: 'POST' });
}
