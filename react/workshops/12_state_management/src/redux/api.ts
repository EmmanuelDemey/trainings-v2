import { people } from '../data/people';
import type { Person } from '../model/person';

/**
 * What the saga needs from the outside world. Injected into the store, so the
 * specs hand it a fake — no HTTP mock, no module mock.
 */
export interface PeopleApi {
  searchPeople: (query: string, signal?: AbortSignal) => Promise<Person[]>;
}

/** The API of the browser: in memory, with a latency you can see. */
export const inMemoryPeopleApi: PeopleApi = {
  searchPeople: (query, signal) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const q = query.trim().toLowerCase();
        resolve(people.filter(({ name }) => name.toLowerCase().includes(q)));
      }, 400);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(signal.reason);
      });
    }),
};
