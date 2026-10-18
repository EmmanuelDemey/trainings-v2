import type { Person } from '../model/person';

export type FetchPerson = (id: string) => Promise<Person>;

// TODO 5.1: fetch every person IN PARALLEL with `Promise.all`, in the order of
//           `ids`. It must reject as soon as one of them fails.
export const loadPeople = async (_ids: readonly string[], _fetchPerson: FetchPerson): Promise<Person[]> => [];

// TODO 5.2: fetch every person with `Promise.allSettled`, and split the results
//           into the people that came back and the ids that failed. It never
//           rejects.
export const loadPeopleSettled = async (
  _ids: readonly string[],
  _fetchPerson: FetchPerson,
): Promise<{ people: Person[]; failedIds: string[] }> => ({ people: [], failedIds: [] });
