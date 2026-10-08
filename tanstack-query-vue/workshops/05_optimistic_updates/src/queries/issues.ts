/**
 * Everything the app knows about reading AND changing issues lives here —
 * including, soon, the cache surgery of the optimistic update, which no
 * component should ever have to read.
 */
import { queryOptions, useMutation, useQueryClient } from '@tanstack/vue-query';
import { createIssue, fetchIssues, updateIssue, type IssueFilter, type IssueStatus } from '@/api/fakeApi';

export const FILTERS: readonly IssueFilter[] = ['open', 'closed', 'all'];

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

export const issueMutationKeys = {
  all: ['issues'] as const,
  create: () => [...issueMutationKeys.all, 'create'] as const,
  toggle: () => [...issueMutationKeys.all, 'toggle'] as const,
};

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.create(),
    mutationFn: createIssue,
    // TODO (step 3) — move the invalidation to `onSettled` (still returned):
    // the pending row must stay on screen until the real row is there, success
    // or failure.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}

export function useToggleIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.toggle(),
    mutationFn: ({ id, status }: { id: number; status: IssueStatus }) => updateIssue(id, { status }),
    // A plain mutation: the row moves only once the PATCH AND the refetch are
    // back — a full second with the default latency.
    //
    // TODO (step 1) — `onMutate`: `await cancelQueries({ queryKey: issueKeys.all })`,
    // snapshot every list with `getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })`,
    // write the new status into every cached list of the snapshot (the issue
    // leaves the list of a status it no longer has, changes in 'all') —
    // immutably — and return `{ snapshot }`.
    // TODO (step 2) — `onError`: put every list of the snapshot back
    // (`setQueryData`). `onSettled`: invalidate `issueKeys.all` — WITHOUT
    // returning the promise.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}
