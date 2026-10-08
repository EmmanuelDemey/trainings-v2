/**
 * Everything the app knows about fetching AND changing issues will live here:
 * the components will only ever call what this file exports — never
 * `fetchIssues`, `createIssue` or `deleteIssue` themselves.
 */
import { queryOptions } from '@tanstack/react-query';
import { fetchIssues, type IssueFilter } from '../api/fakeApi';

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

/**
 * Mutations have keys too — optional, and never used to cache anything. They
 * let `useIsMutating` / `useMutationState` find a mutation from anywhere.
 */
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

// TODO (step 1): `useCreateIssue()` — a `useMutation` with
// `mutationKey: issueMutationKeys.create()`, `mutationFn: createIssue`, and an
// `onSuccess` that RETURNS `queryClient.invalidateQueries({ queryKey: issueKeys.all })`
// (`const queryClient = useQueryClient()` first).

// TODO (step 4): `useDeleteIssue()` — the same, around `deleteIssue`, with
// `mutationKey: issueMutationKeys.delete()`.
