/**
 * Everything the app knows about READING issues will live here: the components
 * will only ever call what this file exports, never `fetchIssues` itself.
 */

// TODO (step 2): write the key factory, every key starting with the same root:
//
//   export const issueKeys = {
//     all: ['issues'] as const,
//     lists: () => [...issueKeys.all, 'list'] as const,
//     list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
//   };
//
// TODO (step 2): then `issuesQuery(filter)`, which returns
// `queryOptions({ queryKey: issueKeys.list(filter), queryFn: () => fetchIssues(filter) })`.

export {};
