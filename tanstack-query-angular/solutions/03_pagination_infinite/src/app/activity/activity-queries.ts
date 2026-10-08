import { infiniteQueryOptions } from '@tanstack/angular-query-experimental';
import { fetchActivity } from '../../api/fakeApi';

export const activityKeys = {
  all: ['activity'] as const,
  feed: () => [...activityKeys.all, 'feed'] as const,
};

/**
 * The feed, as ONE cache entry holding every page loaded so far. The cursor of
 * the next page comes from the last one: `null` on the last page becomes
 * `undefined`, which is what tells TanStack Query there is nothing more.
 */
export function activityFeedQuery() {
  return infiniteQueryOptions({
    queryKey: activityKeys.feed(),
    queryFn: ({ pageParam }) => fetchActivity(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
