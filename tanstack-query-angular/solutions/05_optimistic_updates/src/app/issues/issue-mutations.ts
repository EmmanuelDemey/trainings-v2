/**
 * Everything the app knows about CHANGING issues lives here. Each function is
 * an inject function: call it in an injection context (a field initializer, a
 * constructor), like `injectMutation` itself.
 */
import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import {
  createIssue,
  deleteIssue,
  updateIssue,
  type IssueFilter,
  type IssueStatus,
  type IssueSummary,
} from '../../api/fakeApi';
import { issueKeys } from './issue-queries';

/** The keys of the mutations — what `injectIsMutating` and `injectMutationState` filter on. */
export const issueMutationKeys = {
  all: ['issues'] as const,
  create: () => [...issueMutationKeys.all, 'create'] as const,
  delete: () => [...issueMutationKeys.all, 'delete'] as const,
  status: () => [...issueMutationKeys.all, 'status'] as const,
};

export function injectCreateIssue() {
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationKey: issueMutationKeys.create(),
    mutationFn: (title: string) => createIssue({ title }),
    // RETURNED: the mutation stays pending — and its `variables` on screen as
    // the greyed-out row — until the lists have refetched and the real row,
    // with its id, is there to take its place.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  }));
}

export function injectDeleteIssue() {
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationKey: issueMutationKeys.delete(),
    mutationFn: (id: number) => deleteIssue(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  }));
}

/** A cached list, once issue `id` has changed status: it leaves the list it no longer matches. */
function withStatus(issues: IssueSummary[], id: number, status: IssueStatus, filter: IssueFilter): IssueSummary[] {
  const updated = issues.map((issue) => (issue.id === id ? { ...issue, status } : issue));
  return filter === 'all' ? updated : updated.filter((issue) => issue.status === filter);
}

export function injectSetIssueStatus() {
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationKey: issueMutationKeys.status(),
    mutationFn: ({ id, status }: { id: number; status: IssueStatus }) => updateIssue(id, { status }),

    onMutate: async ({ id, status }) => {
      // A refetch already in flight would land AFTER the optimistic write, and
      // put the old status back on screen.
      await queryClient.cancelQueries({ queryKey: issueKeys.all });

      // Every cached list, as it is now: what `onError` puts back.
      const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() });
      for (const [queryKey, issues] of snapshot) {
        if (!issues) continue;
        // The filter is the last part of the key: ['issues', 'list', filter].
        const filter = queryKey[queryKey.length - 1] as IssueFilter;
        queryClient.setQueryData<IssueSummary[]>(queryKey, withStatus(issues, id, status, filter));
      }
      // A list the issue is not in yet (the "closed" one, when you close it)
      // is left as is: `onSettled` refetches it.
      return { snapshot };
    },

    // The rollback: every list of the snapshot, back as it was.
    onError: (_error, _variables, onMutateResult) => {
      for (const [queryKey, issues] of onMutateResult?.snapshot ?? []) {
        queryClient.setQueryData(queryKey, issues);
      }
    },

    // Success or failure, the server has the last word. NOT returned: the
    // screen is already right (or rolled back), so the mutation settles — and
    // shows its error — now, instead of staying pending until the refetch.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: issueKeys.all });
    },
  }));
}
