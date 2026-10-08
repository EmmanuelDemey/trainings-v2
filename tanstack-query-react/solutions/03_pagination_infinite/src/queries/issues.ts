/**
 * Everything the app knows about READING issues lives here: the components
 * only ever call what this file exports, never `fetchIssuePage` itself.
 */
import { queryOptions } from '@tanstack/react-query';
import { fetchIssuePage } from '../api/fakeApi';

/**
 * The key factory. A page is a query of its own: `['issues', 'page', 2]`. Every
 * key still starts with `issueKeys.all`, so one invalidation reaches every page.
 */
export const issueKeys = {
  all: ['issues'] as const,
  pages: () => [...issueKeys.all, 'page'] as const,
  page: (page: number) => [...issueKeys.pages(), page] as const,
};

/** One page of 10 issues. Also what `prefetchQuery` is given: same key, same fetcher. */
export function issuePageQuery(page: number) {
  return queryOptions({
    queryKey: issueKeys.page(page),
    queryFn: () => fetchIssuePage(page),
  });
}
