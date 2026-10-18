import { queryOptions } from '@tanstack/react-query';
import { fetchPeople, fetchPerson } from '../api/people';

/**
 * The query-key factory: every key of the app is built here, never typed by
 * hand in a component.
 */
export const peopleKeys = {
  all: ['people'] as const,
  // TODO 2.1: each level starts with the one above it —
  //           ['people', 'list'], ['people', 'detail'], ['people', 'detail', id].
  lists: (): readonly unknown[] => [],
  details: (): readonly unknown[] => [],
  detail: (_id: string): readonly unknown[] => [],
};

/** The list of the people. */
export function peopleQuery() {
  // TODO 2.2: the key from the factory.
  // TODO 5.1: refresh the list every 10 seconds (`refetchInterval`).
  return queryOptions({ queryKey: ['TODO'], queryFn: fetchPeople });
}

/** One person. */
export function personQuery(id: string) {
  // TODO 2.2: the key from the factory.
  return queryOptions({ queryKey: ['TODO', id], queryFn: () => fetchPerson(id) });
}

// TODO 3.1: `usePeople()` and `usePerson(id)` — `useQuery` with the options above.

// TODO 4.1: `useLikePerson()` — `useMutation` calling `likePerson`, and, on
//           success, `client.invalidateQueries({ queryKey: peopleKeys.all })` —
//           `client` comes from the callback's last argument, the mutation context.
