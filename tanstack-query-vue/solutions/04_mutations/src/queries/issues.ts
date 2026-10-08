/**
 * Everything the app knows about reading AND changing issues lives here:
 * components call `issuesQuery(…)`, `useCreateIssue()` and `useDeleteIssue()`,
 * never a fetcher. A composable per mutation is the Vue way to keep the
 * callbacks — the cache logic — out of the components.
 */
import { queryOptions, useMutation, useQueryClient } from '@tanstack/vue-query';
import { createIssue, deleteIssue, fetchIssues, type IssueFilter } from '@/api/fakeApi';

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

/** Mutation keys: what `useIsMutating` and `useMutationState` filter on. */
export const issueMutationKeys = {
  all: ['issues'] as const,
  create: () => [...issueMutationKeys.all, 'create'] as const,
  delete: () => [...issueMutationKeys.all, 'delete'] as const,
};

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

export function useCreateIssue() {
  // Called during setup, like every composable: `useQueryClient` injects the
  // client the plugin provided. Calling it inside `onSuccess` would be too
  // late — there is no component instance to inject from any more.
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.create(),
    mutationFn: createIssue,
    // The new issue changes every list AND the counter, which lives in another
    // component that knows nothing about this form. One invalidation of the
    // root key marks them all stale, and refetches those on screen.
    //
    // RETURNED, not just called: the mutation stays `pending` until the lists
    // are refetched — the button stays disabled until the new row is there.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
    // (Bonus) Or skip the refetch: the server answered with the new issue —
    //   onSuccess: (issue) => queryClient.setQueryData(issueKeys.list('open'),
    //     (issues) => issues && [...issues, issue]),
    // …and remember the counter, the 'all' list, and every other list.
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    // The key lets ANY component ask "is a delete in flight?" without a
    // reference to this mutation — `useIsMutating({ mutationKey })`.
    mutationKey: issueMutationKeys.delete(),
    mutationFn: (id: number) => deleteIssue(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}
