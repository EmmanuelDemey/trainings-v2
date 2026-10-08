/**
 * Everything the app knows about READING issues lives here: the components
 * only ever call what this file exports, never `fetchIssues` itself.
 */
import { queryOptions } from '@tanstack/react-query';
import { fetchIssues, type IssueFilter } from '../api/fakeApi';

/**
 * The key factory. Every key starts with `issueKeys.all`, so ONE
 * `invalidateQueries({ queryKey: issueKeys.all })` will hit every issue query
 * at once (workshop 04). Each level is a function, so a key is always built the
 * same way — no hand-written `['issues', filter]` drifting into
 * `['issue', filter]` in another file.
 */
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

/**
 * Key and fetcher travel together: no component can pair a key with the wrong
 * fetcher, and the type of `data` is inferred from `queryFn`. The same object
 * works for `useQuery`, `prefetchQuery`, `getQueryData`… — `queryOptions` only
 * adds types.
 */
export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}
