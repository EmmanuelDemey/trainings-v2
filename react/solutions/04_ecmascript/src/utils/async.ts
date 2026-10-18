import type { Person } from '../model/person';

export type FetchPerson = (id: string) => Promise<Person>;

/**
 * Every person, fetched IN PARALLEL: `Promise.all` starts them all, keeps the
 * order of `ids`, and rejects as soon as one of them fails.
 */
export const loadPeople = async (ids: readonly string[], fetchPerson: FetchPerson): Promise<Person[]> =>
  Promise.all(ids.map(fetchPerson));

/**
 * The people that could be fetched, and the ids that could not: `allSettled`
 * (ES2020) waits for every promise and never rejects.
 */
export const loadPeopleSettled = async (
  ids: readonly string[],
  fetchPerson: FetchPerson,
): Promise<{ people: Person[]; failedIds: string[] }> => {
  const results = await Promise.allSettled(ids.map(fetchPerson));
  const people: Person[] = [];
  const failedIds: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') people.push(result.value);
    else failedIds.push(ids[index]);
  });
  return { people, failedIds };
};
