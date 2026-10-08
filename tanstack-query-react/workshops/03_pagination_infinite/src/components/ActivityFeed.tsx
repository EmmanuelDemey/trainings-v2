import { useQuery } from '@tanstack/react-query';
import { activityFirstPageQuery } from '../queries/activity';

export function ActivityFeed() {
  // TODO (step 3): `useInfiniteQuery(activityFeedQuery)`, then read `data.pages`,
  // `fetchNextPage`, `hasNextPage` and `isFetchingNextPage` from it.
  const { data, isPending, error } = useQuery(activityFirstPageQuery);

  return (
    <section>
      <h2>Activity</h2>

      {error ? (
        <p className="error">{error.message}</p>
      ) : isPending ? (
        <p className="muted">Loading…</p>
      ) : (
        <ul className="feed">
          {/* TODO (step 3): every item of every page — `data.pages.flatMap(…)`. */}
          {data.items.map((event) => (
            <li key={event.id} data-testid={`activity-${event.id}`}>
              {event.message}
            </li>
          ))}
        </ul>
      )}

      {/* TODO (step 3): show `activity-loading-more` while the next page loads
          (`isFetchingNextPage`), and the button only when `hasNextPage`. */}
      <button
        type="button"
        data-testid="load-more"
        onClick={() => {
          // TODO (step 3): `void fetchNextPage()`.
        }}
      >
        Load more
      </button>
    </section>
  );
}
