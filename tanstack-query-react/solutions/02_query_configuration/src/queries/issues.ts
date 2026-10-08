/**
 * Everything the app knows about READING issues lives here: the components
 * only ever call what this file exports, never `fetchIssues` or `fetchIssue`.
 */
import { queryOptions, skipToken, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { fetchIssue, fetchIssues, type Issue, type IssueFilter, type IssueSummary } from '../api/fakeApi';

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
  detail: (id: number | null) => [...issueKeys.details(), id] as const,
};

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

/**
 * What the detail panel shows: the full issue once it arrived, or — while it is
 * on its way — the summary a list already holds, which has no description.
 */
export type IssueDetail = Issue | IssueSummary;

export function issueQuery(id: number | null) {
  return queryOptions({
    queryKey: issueKeys.detail(id),
    // No issue selected, no request. `skipToken` rather than `enabled: false`:
    // TypeScript knows `id` is a number in the other branch, no `id!` needed.
    queryFn: id === null ? skipToken : (): Promise<IssueDetail> => fetchIssue(id),
  });
}

/** The summary of issue `id`, from whichever list in the cache holds it. */
function summaryFromLists(queryClient: QueryClient, id: number): IssueSummary | undefined {
  for (const [, issues] of queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })) {
    const issue = issues?.find((candidate) => candidate.id === id);
    if (issue) return issue;
  }
  return undefined;
}

/**
 * The detail of an issue, with the title on screen at once.
 *
 * `placeholderData`, not `initialData`: a placeholder is SHOWN, never written to
 * the cache, and the query still fetches. `initialData` would store the summary
 * as if it were the issue — fresh for 30 s, so the description would not be
 * fetched before then.
 */
export function useIssue(id: number | null) {
  const queryClient = useQueryClient();

  return useQuery({
    ...issueQuery(id),
    placeholderData: () => (id === null ? undefined : summaryFromLists(queryClient, id)),
  });
}
