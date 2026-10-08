import { useInfiniteQuery } from '@tanstack/react-query';
import { activityFeedQuery } from '../queries/activity';

export function ActivityFeed() {
  const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(activityFeedQuery);

  return (
    <section>
      <h2>Activity</h2>

      {error ? (
        <p className="error">{error.message}</p>
      ) : isPending ? (
        <p className="muted">Loading…</p>
      ) : (
        <ul className="feed">
          {/* `data.pages` holds every page loaded so far, in order. */}
          {data.pages.flatMap((page) =>
            page.items.map((event) => (
              <li key={event.id} data-testid={`activity-${event.id}`}>
                {event.message}
              </li>
            )),
          )}
        </ul>
      )}

      {isFetchingNextPage && (
        <p className="muted" data-testid="activity-loading-more">
          Loading more…
        </p>
      )}
      {/* No next page, no button: the last page said `nextCursor: null`. */}
      {hasNextPage && (
        <button
          type="button"
          data-testid="load-more"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          Load more
        </button>
      )}
    </section>
  );
}
