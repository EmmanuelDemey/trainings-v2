import type { Person } from '../model/person';
import { apiUrl } from './config';

/** A response that arrived, but with an error status. */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  // `fetch` only rejects when there is NO response (network down, aborted).
  // A 404 or a 500 resolves like a 200: checking `ok` is our job.
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new HttpError(response.status);
  }
  return (await response.json()) as T;
}

export function fetchPeople(signal?: AbortSignal): Promise<Person[]> {
  return getJson<Person[]>(apiUrl('/people'), signal);
}

export function fetchPerson(id: string, signal?: AbortSignal): Promise<Person> {
  return getJson<Person>(apiUrl(`/people/${encodeURIComponent(id)}`), signal);
}
