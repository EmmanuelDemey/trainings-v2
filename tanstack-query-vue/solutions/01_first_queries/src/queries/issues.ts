/**
 * Everything the app knows about READING issues lives here. Components never
 * import `fetchIssues`: they ask for `issuesQuery(filter)`, and get the key and
 * the fetcher together.
 */
import { queryOptions } from '@tanstack/vue-query';
import { fetchIssues, type IssueFilter } from '@/api/fakeApi';

/**
 * The key factory. Every key starts with `issueKeys.all`, from the most
 * generic to the most specific — so `{ queryKey: issueKeys.all }` matches
 * every issue query at once (chapter 04 invalidates with it), and
 * `issueKeys.lists()` every list, whatever its filter.
 */
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

/**
 * Key and fetcher travel together: no component can pair the key of the open
 * issues with the fetcher of the closed ones. `queryOptions` adds nothing at
 * runtime — it types the key with the data it holds, so
 * `queryClient.getQueryData(issuesQuery('open').queryKey)` is an
 * `IssueSummary[] | undefined`, not an `unknown`.
 */
export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}
