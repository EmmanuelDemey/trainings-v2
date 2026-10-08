/**
 * Everything the app knows about fetching and changing issues lives here — the
 * components only ever call what this file exports.
 *
 * The key factory is given: every key the app uses starts with `issueKeys.all`,
 * which is what lets ONE `invalidateQueries({ queryKey: issueKeys.all })` hit
 * every list at once.
 */
import type { IssueFilter } from '@/api/fakeApi';

export const issueKeys = {
  all: ['issues'] as const,
  list: (filter: IssueFilter) => [...issueKeys.all, filter] as const,
};

// TODO 1.3 — `issuesQuery(filter)`: return `queryOptions({ queryKey, queryFn })`
//            for one filter, with `issueKeys.list(filter)` as its key.

// TODO 3.1 — `useCreateIssue()`: a `useMutation` around `createIssue` that
//            invalidates `issueKeys.all` on success.

// TODO 4.1 — `useSetIssueStatus()`: a `useMutation` around `setIssueStatus`,
//            optimistic — `onMutate` / `onError` / `onSettled`.
