/**
 * Everything the app knows about fetching AND changing issues lives here: the
 * components only ever call what this file exports — never `fetchIssues`,
 * `createIssue` or `updateIssue` themselves.
 */
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createIssue, fetchIssues, updateIssue, type IssueFilter, type IssueStatus, type IssueSummary } from '../api/fakeApi';

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

/**
 * Optimistic through the UI: this hook changes nothing in the cache. The form
 * renders the mutation's `variables` — the title on its way — while it is
 * pending.
 */
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.create(),
    mutationFn: createIssue,
    // `onSettled`, so a failed creation refetches too. RETURNED: the mutation
    // stays pending — and the greyed-out row on screen — until the lists are
    // back with the real row in them. No gap, no flicker.
    onSettled: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}

interface StatusChange {
  id: number;
  status: IssueStatus;
}

/**
 * Optimistic through the cache: every list shows the new status at once, and
 * the server confirms — or refuses, and the lists are put back.
 */
export function useSetIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.setStatus(),
    mutationFn: ({ id, status }: StatusChange) => updateIssue(id, { status }),

    onMutate: async ({ id, status }) => {
      // A refetch already in flight would land AFTER the optimistic write, and
      // put the old status back on screen.
      await queryClient.cancelQueries({ queryKey: issueKeys.all });

      // What every list looked like — the rollback needs it.
      const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() });

      // Every cached list that holds the issue gets its new status…
      queryClient.setQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() }, (issues) =>
        issues?.map((issue) => (issue.id === id ? { ...issue, status } : issue)),
      );
      // …and the list filtered on the OTHER status loses it. The list it joins
      // (the closed one, when you close it) is left alone: `onSettled` refetches it.
      const leaving = status === 'open' ? 'closed' : 'open';
      queryClient.setQueryData<IssueSummary[]>(issueKeys.list(leaving), (issues) =>
        issues?.filter((issue) => issue.id !== id),
      );

      // Whatever `onMutate` returns reaches `onError` and `onSettled`.
      return { snapshot };
    },

    onError: (_error, _variables, onMutateResult) => {
      // Put every list back exactly as it was, untouched lists included.
      for (const [queryKey, issues] of onMutateResult?.snapshot ?? []) {
        queryClient.setQueryData(queryKey, issues);
      }
    },

    // Success or failure, the server has the last word. NOT returned, unlike
    // in `useCreateIssue`: the screen is already right (or rolled back), so the
    // mutation settles — and shows its error — now, instead of staying pending
    // until the refetch is back.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: issueKeys.all });
    },
  });
}
