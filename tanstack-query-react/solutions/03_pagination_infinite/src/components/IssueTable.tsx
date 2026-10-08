import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { issuePageQuery } from '../queries/issues';

export function IssueTable() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isPending, isPlaceholderData, error } = useQuery({
    ...issuePageQuery(page),
    // Page 2 is a NEW key: without this, `data` would be undefined — and the
    // table empty — until it arrives. With it, page 1 stays on screen,
    // flagged `isPlaceholderData`, until page 2 replaces it.
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.totalPages ?? 1;
  const hasNext = page < totalPages;

  // As soon as a page is really on screen, fetch the next one in the
  // background: by the time the user clicks, it is in the cache. Fresh for 30 s
  // (`staleTime`), so the click itself sends nothing.
  useEffect(() => {
    if (!isPlaceholderData && hasNext) {
      void queryClient.prefetchQuery(issuePageQuery(page + 1));
    }
  }, [queryClient, page, hasNext, isPlaceholderData]);

  return (
    <section>
      <h2>All issues</h2>

      {error ? (
        <p className="error">{error.message}</p>
      ) : isPending ? (
        <p className="muted" data-testid="issues-loading">
          Loading…
        </p>
      ) : (
        // Dimmed while it shows the previous page.
        <table className={isPlaceholderData ? 'issues-table dimmed' : 'issues-table'}>
          <tbody>
            {data.items.map((issue) => (
              <tr key={issue.id} data-testid={`issue-${issue.id}`}>
                <td>#{issue.id}</td>
                <td className={issue.status === 'closed' ? 'closed' : undefined}>{issue.title}</td>
                <td className="muted">{issue.assignee ?? 'unassigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="row">
        <button type="button" data-testid="page-prev" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span data-testid="page-indicator">
          Page {page} / {totalPages}
        </span>
        {/* While the previous page stands in, we do not know yet whether there
            is a next one: no clicking ahead of the server. */}
        <button
          type="button"
          data-testid="page-next"
          disabled={isPlaceholderData || !hasNext}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
