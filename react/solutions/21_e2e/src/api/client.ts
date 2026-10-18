import type { Person } from '../model/person';

export type NewPerson = Pick<Person, 'name'> & Partial<Omit<Person, 'id' | 'name'>>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(response.status, body.message ?? `HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export const getPeople = (signal?: AbortSignal) => request<Person[]>('/api/people', { signal });

export const getPerson = (id: string, signal?: AbortSignal) =>
  request<Person>(`/api/people/${encodeURIComponent(id)}`, { signal });

export const createPerson = (person: NewPerson) =>
  request<Person>('/api/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(person),
  });
