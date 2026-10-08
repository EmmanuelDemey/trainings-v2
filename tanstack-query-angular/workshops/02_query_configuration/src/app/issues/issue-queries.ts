/**
 * Everything the app knows about reading issues lives here: the components
 * only ever call what this file exports.
 */
import { queryOptions } from '@tanstack/angular-query-experimental';
import { fetchIssue, fetchIssues, type IssueFilter } from '../../api/fakeApi';

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

// TODO (step 2): accept `id: number | undefined`, and send nothing without an
// id — `skipToken` as the query function (or `enabled: id !== undefined`).
export function issueDetailQuery(id: number) {
  return queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: () => fetchIssue(id),
  });
}

// TODO (step 3): `issueSummaryFromLists(queryClient, id)` — the summary of an
// issue from any list already in the cache (`getQueriesData` on
// `issueKeys.lists()`), or `undefined`.
