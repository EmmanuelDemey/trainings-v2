/**
 * The activity feed. For now, a plain query for the first page only.
 */
import { queryOptions } from '@tanstack/react-query';
import { fetchActivity } from '../api/fakeApi';

export const activityKeys = {
  all: ['activity'] as const,
  feed: () => [...activityKeys.all, 'feed'] as const,
};

// TODO (step 3): replace it with ONE infinite query, whose data is every page
// loaded so far:
//
//   export const activityFeedQuery = infiniteQueryOptions({
//     queryKey: activityKeys.feed(),
//     queryFn: ({ pageParam }) => fetchActivity(pageParam),
//     initialPageParam: 0,
//     getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
//   });
//
// Why `?? undefined`: what does TanStack Query make of a `null` page param?
export const activityFirstPageQuery = queryOptions({
  queryKey: activityKeys.feed(),
  queryFn: () => fetchActivity(0),
});
