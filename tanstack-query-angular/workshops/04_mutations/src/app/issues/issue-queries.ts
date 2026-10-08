/**
 * Everything the app knows about reading issues lives here: the components
 * only ever call what this file exports.
 */
import { queryOptions } from '@tanstack/angular-query-experimental';
import { fetchIssues, type IssueFilter } from '../../api/fakeApi';

/**
 * The key factory. Every key starts with `issueKeys.all`, from the most generic
 * to the most specific — which is what lets ONE `invalidateQueries({ queryKey:
 * issueKeys.all })` hit every list at once, later on.
 */
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
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
