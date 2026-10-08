/**
 * The issues, a page at a time. Components never import a fetcher: they ask
 * for `issuePageQuery(page)`.
 */
import { queryOptions } from '@tanstack/vue-query';
import { fetchIssuePage } from '@/api/fakeApi';

export const issueKeys = {
  all: ['issues'] as const,
  pages: () => [...issueKeys.all, 'page'] as const,
  page: (page: number) => [...issueKeys.pages(), page] as const,
};

/** One page, one key: page 2 and page 3 are two entries of the cache. */
export function issuePageQuery(page: number) {
  return queryOptions({
    queryKey: issueKeys.page(page),
    queryFn: () => fetchIssuePage(page),
  });
}
