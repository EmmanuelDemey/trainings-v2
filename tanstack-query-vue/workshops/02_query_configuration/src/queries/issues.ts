/**
 * Everything the app knows about READING issues lives here. Components never
 * import a fetcher: they ask for `issuesQuery(filter)` or `issueQuery(id)`.
 */
import { queryOptions } from '@tanstack/vue-query';
import { fetchIssue, fetchIssues, type IssueFilter } from '@/api/fakeApi';

/**
 * The key factory, from the most generic to the most specific:
 * `issueKeys.all` matches every issue query, `issueKeys.lists()` every list
 * whatever its filter, `issueKeys.details()` every detail.
 */
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  // TODO (step 2) — accept `number | undefined`: "nothing selected" is a state
  // of the detail query, not an error.
  detail: (id: number) => [...issueKeys.details(), id] as const,
};

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

/** One issue, with its description. */
export function issueQuery(id: number) {
  // TODO (step 2) — until an issue is selected, this query must not run:
  // `queryFn: id === undefined ? skipToken : () => fetchIssue(id)` (or
  // `enabled: false` in the component).
  return queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: () => fetchIssue(id),
  });
}
