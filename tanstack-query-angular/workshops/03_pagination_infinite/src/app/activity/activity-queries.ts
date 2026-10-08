import { queryOptions } from '@tanstack/angular-query-experimental';
import { fetchActivity } from '../../api/fakeApi';

export const activityKeys = {
  all: ['activity'] as const,
  feed: () => [...activityKeys.all, 'feed'] as const,
};

// TODO (step 3): an `infiniteQueryOptions` instead — `initialPageParam: 0`,
// `queryFn: ({ pageParam }) => fetchActivity(pageParam)`, and
// `getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined`.
export function activityFeedQuery() {
  return queryOptions({
    queryKey: activityKeys.feed(),
    queryFn: () => fetchActivity(0),
  });
}
