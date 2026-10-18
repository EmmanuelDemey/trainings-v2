import { people as seed } from '../src/data/people.ts';
import type { Person } from '../src/model/person.ts';

export interface ApiResponse {
  status: number;
  body?: unknown;
}

/**
 * An in-memory people API, as plain functions: no HTTP here, so it is unit
 * tested in `peopleApi.spec.ts` and plugged into the dev server by `fakeApi.ts`.
 */
export function createPeopleApi() {
  let people: Person[] = structuredClone(seed);
  let nextId = 100;

  return {
    handle(method: string, path: string, body?: unknown): ApiResponse | undefined {
      if (method === 'GET' && path === '/api/people') {
        return { status: 200, body: people };
      }

      const match = /^\/api\/people\/([^/]+)$/.exec(path);
      if (method === 'GET' && match) {
        const person = people.find(({ id }) => id === match[1]);
        return person ? { status: 200, body: person } : { status: 404, body: { message: 'Person not found' } };
      }

      if (method === 'POST' && path === '/api/people') {
        const input = (body ?? {}) as Partial<Person>;
        if (!input.name?.trim()) return { status: 400, body: { message: 'Name is required' } };
        const person: Person = {
          id: String(nextId++),
          name: input.name.trim(),
          height: input.height ?? 'unknown',
          mass: input.mass ?? 'unknown',
          hairColor: input.hairColor ?? 'unknown',
          skinColor: input.skinColor ?? 'unknown',
          eyeColor: input.eyeColor ?? 'unknown',
          birthYear: input.birthYear ?? 'unknown',
          gender: input.gender ?? 'unknown',
        };
        people = [...people, person];
        return { status: 201, body: person };
      }

      // Test-only: puts the seed data back, so every e2e test starts from the
      // same backend state (`cy.resetApi()`).
      if (method === 'POST' && path === '/api/reset') {
        people = structuredClone(seed);
        nextId = 100;
        return { status: 204 };
      }

      return undefined;
    },
  };
}
