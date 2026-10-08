/**
 * Everything the app knows about CHANGING issues lives here. Each function is
 * an inject function: call it in an injection context (a field initializer, a
 * constructor), like `injectMutation` itself.
 */
import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { createIssue, deleteIssue } from '../../api/fakeApi';
import { issueKeys } from './issue-queries';

/** The keys of the mutations — what `injectIsMutating` and `injectMutationState` filter on. */
export const issueMutationKeys = {
  all: ['issues'] as const,
  create: () => [...issueMutationKeys.all, 'create'] as const,
  delete: () => [...issueMutationKeys.all, 'delete'] as const,
};

export function injectCreateIssue() {
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationKey: issueMutationKeys.create(),
    mutationFn: (title: string) => createIssue({ title }),
    // RETURNED: the mutation stays pending until every list has refetched, so
    // the button stays disabled until the new issue is on screen. Every key
    // starts with `issueKeys.all`: the list AND the counter in the header.
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
