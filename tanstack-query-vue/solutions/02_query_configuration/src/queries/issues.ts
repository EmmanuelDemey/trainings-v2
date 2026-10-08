/**
 * Everything the app knows about READING issues lives here. Components never
 * import a fetcher: they ask for `issuesQuery(filter)` or `issueQuery(id)`.
 */
import { queryOptions, skipToken } from '@tanstack/vue-query';
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
  detail: (id: number | undefined) => [...issueKeys.details(), id] as const,
};

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

/**
 * One issue, with its description. Until an issue is selected, the query
 * function is `skipToken`: the query exists, is disabled, and never sends
 * `GET /issues/undefined`. Same effect as `enabled: id !== undefined`, but
 * TypeScript KNOWS `id` is a number inside the fetcher — no `id!`.
 */
export function issueQuery(id: number | undefined) {
  return queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: id === undefined ? skipToken : () => fetchIssue(id),
  });
}
