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
  // TODO 2.2: pass the `signal` to `fetch`, so that the caller can abort the request.
  void signal;
  const response = await fetch(url);
  // TODO 2.1: `fetch` resolves for a 404 or a 500 too — throw an `HttpError`
  // when the response is not `ok`.
  return (await response.json()) as T;
}

export function fetchPeople(signal?: AbortSignal): Promise<Person[]> {
  return getJson<Person[]>(apiUrl('/people'), signal);
}

export function fetchPerson(id: string, signal?: AbortSignal): Promise<Person> {
  return getJson<Person>(apiUrl(`/people/${encodeURIComponent(id)}`), signal);
}
