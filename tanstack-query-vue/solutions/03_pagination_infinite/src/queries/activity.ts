/**
 * The activity feed: newest first, ten events at a time, on a cursor.
 */
import { infiniteQueryOptions } from '@tanstack/vue-query';
import { fetchActivity } from '@/api/fakeApi';

export const activityKeys = {
  all: ['activity'] as const,
  feed: () => [...activityKeys.all, 'feed'] as const,
};

/**
 * ONE query for the whole feed, however many pages it holds: its data is
 * `{ pages, pageParams }`, and `fetchNextPage()` appends to it.
 */
export function activityFeedQuery() {
  return infiniteQueryOptions({
    queryKey: activityKeys.feed(),
    queryFn: ({ pageParam }) => fetchActivity(pageParam),
    // The cursor of the first page.
    initialPageParam: 0,
    // The cursor of the next page — `undefined` means "there is none", which
    // turns `hasNextPage` to false. The server says `null`: translate it.
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // (Bonus) `maxPages: 3` keeps at most three pages in memory — and to
    // scroll back up, add `getPreviousPageParam`.
  });
}
