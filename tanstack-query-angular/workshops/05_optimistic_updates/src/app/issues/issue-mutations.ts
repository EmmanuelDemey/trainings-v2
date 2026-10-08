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
  type IssueStatus,
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
    // RETURNED: the mutation stays pending until every list has refetched.
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

// TODO (step 1): a helper that returns a cached list once issue `id` has
// changed status — the issue leaves a list it no longer matches.

export function injectSetIssueStatus() {
  const queryClient = inject(QueryClient);

  // Pessimistic: nothing moves until the PATCH is back AND the lists have
  // refetched — two round trips after the click.
  return injectMutation(() => ({
    mutationKey: issueMutationKeys.status(),
    mutationFn: ({ id, status }: { id: number; status: IssueStatus }) => updateIssue(id, { status }),
    // TODO (step 1): `onMutate` — cancel `issueKeys.all`, snapshot every list
    // with `getQueriesData`, write the new status into every cached list, and
    // return `{ snapshot }`.
    // TODO (step 2): `onError` puts the snapshot back; `onSettled` invalidates
    // `issueKeys.all` WITHOUT returning the promise (and this `onSuccess` goes).
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  }));
}
