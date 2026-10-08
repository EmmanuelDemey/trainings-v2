/**
 * Everything the app knows about fetching AND changing issues lives here: the
 * components only ever call what this file exports — never `fetchIssues`,
 * `createIssue` or `deleteIssue` themselves.
 */
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createIssue, deleteIssue, fetchIssues, type IssueFilter } from '../api/fakeApi';

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

/**
 * Mutations have keys too — optional, and never used to cache anything. They
 * let `useIsMutating` / `useMutationState` find a mutation from anywhere, and
 * `setMutationDefaults` configure it.
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

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.create(),
    mutationFn: createIssue,
    // Every list, and the counter, start with `issueKeys.all`: one call marks
    // them all stale, and refetches those on screen. RETURNING the promise
    // keeps the mutation pending until they are back — the button stays
    // disabled until the new issue is on screen.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.delete(),
    mutationFn: deleteIssue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}
