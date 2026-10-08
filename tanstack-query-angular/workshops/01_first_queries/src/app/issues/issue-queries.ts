/**
 * Everything the app knows about reading issues will live here: the components
 * will only ever call what this file exports.
 */

// TODO (step 2): the key factory `issueKeys`, from the most generic key to the
// most specific one:
//   all: ['issues']  →  lists(): ['issues', 'list']  →  list(filter): ['issues', 'list', filter]

// TODO (step 2): `issuesQuery(filter)`, built with `queryOptions` from
// '@tanstack/angular-query-experimental': `issueKeys.list(filter)` as its key,
// `() => fetchIssues(filter)` as its query function.

export {};
