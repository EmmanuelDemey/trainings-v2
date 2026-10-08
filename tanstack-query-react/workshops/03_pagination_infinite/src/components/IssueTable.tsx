import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { issuePageQuery } from '../queries/issues';

export function IssueTable() {
  const [page, setPage] = useState(1);

  // TODO (step 1): page 2 is a NEW key, so `data` is undefined — and the table
  // empty — until it arrives. Spread `issuePageQuery(page)` into an object with
  // `placeholderData: keepPreviousData`, and read `isPlaceholderData` too.
  const { data, isPending, error } = useQuery(issuePageQuery(page));

  const totalPages = data?.totalPages ?? 1;
  const hasNext = page < totalPages;

  // TODO (step 2): as soon as a page is REALLY on screen (not a placeholder),
  // prefetch the next one in an effect:
  // `queryClient.prefetchQuery(issuePageQuery(page + 1))`, with
  // `const queryClient = useQueryClient()`.

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
        // TODO (step 1): add the `dimmed` class while `isPlaceholderData`.
        <table className="issues-table">
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
        {/* TODO (step 1): also disabled while `isPlaceholderData`. */}
        <button type="button" data-testid="page-next" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </section>
  );
}
