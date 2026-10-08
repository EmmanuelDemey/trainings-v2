/**
 * The activity feed: ONE infinite query, whose data is every page loaded so
 * far — not one query per page.
 */
import { infiniteQueryOptions } from '@tanstack/react-query';
import { fetchActivity } from '../api/fakeApi';

export const activityKeys = {
  all: ['activity'] as const,
  feed: () => [...activityKeys.all, 'feed'] as const,
};

export const activityFeedQuery = infiniteQueryOptions({
  queryKey: activityKeys.feed(),
  // `pageParam` is the cursor: `initialPageParam` for the first page, then
  // whatever `getNextPageParam` returned for the previous one.
  queryFn: ({ pageParam }) => fetchActivity(pageParam),
  initialPageParam: 0,
  // `undefined` means "no next page": `hasNextPage` turns false. The API says
  // so with `null`, which TanStack Query would take for a real cursor.
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  // (Bonus) Keep at most 5 pages in memory: past that, the oldest is dropped —
  // and refetched only if `getPreviousPageParam` is defined and asked for.
  maxPages: 5,
});
