/**
 * Everything the app knows about fetching AND changing issues lives here: the
 * components only ever call what this file exports — never `fetchIssues`,
 * `createIssue` or `updateIssue` themselves.
 */
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createIssue, fetchIssues, updateIssue, type IssueFilter, type IssueStatus } from '../api/fakeApi';

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

export const issueMutationKeys = {
  all: ['issues'] as const,
  create: () => [...issueMutationKeys.all, 'create'] as const,
  setStatus: () => [...issueMutationKeys.all, 'set-status'] as const,
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
    // TODO (step 3): `onSettled` instead, so a failed creation refetches too —
    // still RETURNED: the pending row must stay until the real one is there.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}

interface StatusChange {
  id: number;
  status: IssueStatus;
}

/**
 * Closes or reopens an issue — the pessimistic way: nothing moves on screen
 * until the server answered AND the lists came back.
 */
export function useSetIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.setStatus(),
    mutationFn: ({ id, status }: StatusChange) => updateIssue(id, { status }),

    // TODO (step 1): `onMutate: async ({ id, status }) => { … }`
    //   1. `await queryClient.cancelQueries({ queryKey: issueKeys.all })`
    //   2. `const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })`
    //   3. `queryClient.setQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() }, …)`:
    //      the new status in every list, and the issue OUT of the list filtered
    //      on the other status (`setQueryData(issueKeys.list(leaving), …)`)
    //   4. `return { snapshot }`
    //
    // TODO (step 2): `onError: (_error, _variables, onMutateResult) => …` puts
    // every list of `onMutateResult?.snapshot` back with `setQueryData`.
    //
    // TODO (step 2): replace this `onSuccess` with an `onSettled` that
    // invalidates WITHOUT returning the promise. Why not return it here?
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}
