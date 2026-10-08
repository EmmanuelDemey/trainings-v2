/**
 * The activity feed: newest first, ten events at a time, on a cursor.
 */
import { queryOptions } from '@tanstack/vue-query';
import { fetchActivity } from '@/api/fakeApi';

export const activityKeys = {
  all: ['activity'] as const,
  feed: () => [...activityKeys.all, 'feed'] as const,
};

// TODO (step 3) — replace this one-page query with `activityFeedQuery()`,
// built with `infiniteQueryOptions`: ONE query for the whole feed, with
//   queryFn: ({ pageParam }) => fetchActivity(pageParam),
//   initialPageParam: 0,
//   getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
/** The first page of the feed — and only the first. */
export function activityFirstPageQuery() {
  return queryOptions({
    queryKey: activityKeys.feed(),
    queryFn: () => fetchActivity(0),
  });
}
