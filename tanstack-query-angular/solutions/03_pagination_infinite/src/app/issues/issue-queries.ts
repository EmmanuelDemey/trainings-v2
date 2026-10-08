/**
 * Everything the app knows about reading issues lives here: the components
 * only ever call what this file exports.
 */
import { queryOptions } from '@tanstack/angular-query-experimental';
import { fetchIssuePage } from '../../api/fakeApi';

/** The key factory: every key starts with `issueKeys.all`. */
export const issueKeys = {
  all: ['issues'] as const,
  pages: () => [...issueKeys.all, 'page'] as const,
  page: (page: number) => [...issueKeys.pages(), page] as const,
};

/** One page of the table — its own key, so its own cache entry. */
export function issuePageQuery(page: number) {
  return queryOptions({
    queryKey: issueKeys.page(page),
    queryFn: () => fetchIssuePage(page),
  });
}
