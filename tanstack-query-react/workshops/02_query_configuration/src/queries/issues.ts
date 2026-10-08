/**
 * Everything the app knows about READING issues lives here: the components
 * only ever call what this file exports, never `fetchIssues` or `fetchIssue`.
 */
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchIssue, fetchIssues, type IssueFilter } from '../api/fakeApi';

/**
 * The key factory. Every key starts with `issueKeys.all`; the lists and the
 * details each have a level of their own, so `getQueriesData({ queryKey:
 * issueKeys.lists() })` reads every list — and no detail.
 */
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (id: number | undefined) => [...issueKeys.details(), id] as const,
};

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

/** The detail of an issue — the naive version. */
export function useIssue(id: number | undefined) {
  // TODO (step 2): no issue selected, no request. Replace the function with
  // `id === undefined ? skipToken : () => fetchIssue(id)` (or add
  // `enabled: id !== undefined`) — and the `as number` lie goes away.
  //
  // TODO (step 3): the lists in the cache already hold the summary of this
  // issue. Add a `placeholderData` function that returns it — read them with
  // `useQueryClient().getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })`.
  // `placeholderData`, not `initialData`: why?
  return useQuery({
    queryKey: issueKeys.detail(id),
    queryFn: () => fetchIssue(id as number),
  });
}
