import type { Person } from '../model/person';
import type { PersonInput } from '../schemas/person';

/** The server refused the request — `message` is meant to be shown to the user. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function createPerson(input: PersonInput): Promise<Person> {
  const response = await fetch('/api/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const { message } = (await response.json()) as { message: string };
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as Person;
}
