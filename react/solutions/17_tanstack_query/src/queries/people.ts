import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { fetchPeople, fetchPerson, likePerson } from '../api/people';

/**
 * The query-key factory: every key of the app is built here, never typed by
 * hand in a component. Each level starts with the one above it, so
 * invalidating `peopleKeys.all` reaches the list AND every detail.
 */
export const peopleKeys = {
  all: ['people'] as const,
  lists: () => [...peopleKeys.all, 'list'] as const,
  details: () => [...peopleKeys.all, 'detail'] as const,
  detail: (id: string) => [...peopleKeys.details(), id] as const,
};

/** The list, refreshed in the background every 10 s while it is on screen. */
export function peopleQuery() {
  return queryOptions({
    queryKey: peopleKeys.lists(),
    queryFn: fetchPeople,
    // Polling: someone else may like a character in another tab. Paused while
    // the tab is hidden (`refetchIntervalInBackground` is false by default).
    refetchInterval: 10_000,
  });
}

export function personQuery(id: string) {
  return queryOptions({
    queryKey: peopleKeys.detail(id),
    queryFn: () => fetchPerson(id),
  });
}

export function usePeople() {
  return useQuery(peopleQuery());
}

export function usePerson(id: string) {
  return useQuery(personQuery(id));
}

export function useLikePerson() {
  return useMutation({
    mutationFn: likePerson,
    // The last argument of every callback is the mutation's context: its
    // `client` is the QueryClient it runs in — no `useQueryClient()` needed.
    // Returning the promise keeps the mutation pending until the refetch is
    // done: the button stays disabled until the new count is on screen.
    onSuccess: (_person, _id, _onMutateResult, { client }) => client.invalidateQueries({ queryKey: peopleKeys.all }),
  });
}
