/**
 * Everything the app knows about reading AND changing issues will live here:
 * components call `issuesQuery(…)` and the mutation composables, never a
 * fetcher.
 */
import { queryOptions } from '@tanstack/vue-query';
import { fetchIssues, type IssueFilter } from '@/api/fakeApi';

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

// TODO (step 4) — mutation keys, for `useIsMutating` to filter on:
//   export const issueMutationKeys = {
//     all: ['issues'] as const,
//     create: () => [...issueMutationKeys.all, 'create'] as const,
//     delete: () => [...issueMutationKeys.all, 'delete'] as const,
//   };

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

// TODO (step 1) — `useCreateIssue()`: `useQueryClient()` (during setup), then
// a `useMutation` whose `mutationFn` is `createIssue` and whose `onSuccess`
// RETURNS `queryClient.invalidateQueries({ queryKey: issueKeys.all })`.

// TODO (step 4) — `useDeleteIssue()`: the same, around `deleteIssue`, with a
// `mutationKey`.
