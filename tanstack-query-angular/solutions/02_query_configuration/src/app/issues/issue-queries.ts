/**
 * Everything the app knows about reading issues lives here: the components
 * only ever call what this file exports.
 */
import { type QueryClient, queryOptions, skipToken } from '@tanstack/angular-query-experimental';
import { fetchIssue, fetchIssues, type Issue, type IssueFilter, type IssueSummary } from '../../api/fakeApi';

/**
 * The key factory. Every key starts with `issueKeys.all`, from the most generic
 * to the most specific — which is what lets ONE `invalidateQueries({ queryKey:
 * issueKeys.all })` hit every list and every detail at once, later on.
 */
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (id: number | undefined) => [...issueKeys.details(), id] as const,
};

/**
 * Key and fetcher travel together: no component can pair a key with the wrong
 * fetcher, and the type of `data` is inferred from `queryFn`.
 */
export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

/**
 * What the detail panel shows: a full `Issue` once it arrived — or, before
 * that, the `IssueSummary` a list already holds, without the description.
 */
export type IssueView = IssueSummary & Partial<Pick<Issue, 'description' | 'createdAt' | 'updatedAt'>>;

/**
 * One issue. Without an id, `skipToken` instead of a query function: the query
 * is disabled — exactly like `enabled: false` — and TypeScript knows that, in
 * the function, `id` is a number. With `enabled: id !== undefined` instead, you
 * would still need `fetchIssue(id!)`.
 */
export function issueDetailQuery(id: number | undefined) {
  return queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: id === undefined ? skipToken : (): Promise<IssueView> => fetchIssue(id),
  });
}

/**
 * The summary of an issue, from any list already in the cache — or `undefined`.
 * Read with `getQueriesData`: the issue may sit in the "open" list, the "all"
 * one, or both.
 */
export function issueSummaryFromLists(queryClient: QueryClient, id: number): IssueSummary | undefined {
  for (const [, issues] of queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })) {
    const issue = issues?.find((candidate) => candidate.id === id);
    if (issue) return issue;
  }
  return undefined;
}
