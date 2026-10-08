/**
 * Everything the app knows about READING issues will live here. Components
 * should never import `fetchIssues`: they will ask for `issuesQuery(filter)`,
 * and get the key and the fetcher together.
 */

// TODO (step 2) — the key factory. Every key starts with the same root, from
// the most generic to the most specific:
//
//   export const issueKeys = {
//     all: ['issues'] as const,
//     lists: () => [...issueKeys.all, 'list'] as const,
//     list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
//   };

// TODO (step 2) — `issuesQuery(filter)`: returns
// `queryOptions({ queryKey: issueKeys.list(filter), queryFn: () => fetchIssues(filter) })`.

export {};
