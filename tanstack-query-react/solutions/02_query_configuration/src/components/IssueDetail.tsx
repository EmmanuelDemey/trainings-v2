import { useIssue } from '../queries/issues';

interface IssueDetailProps {
  id: number | null;
}

export function IssueDetail({ id }: IssueDetailProps) {
  // Called before any early return: hooks run in the same order on every render.
  const { data: issue, error } = useIssue(id);

  if (id === null) {
    return (
      <aside className="detail">
        <p className="muted" data-testid="detail-empty">
          Select an issue to see its details.
        </p>
      </aside>
    );
  }

  return (
    <aside className="detail">
      {error ? (
        <p className="error">{error.message}</p>
      ) : !issue ? (
        // Only when no list holds the issue: the placeholder covers the rest.
        <p className="muted">Loading…</p>
      ) : (
        <>
          <h2 data-testid="detail-title">
            #{issue.id} {issue.title}
          </h2>
          <p className="muted">
            {issue.status} · {issue.assignee ?? 'unassigned'} · {issue.commentCount} comment(s)
          </p>
          {/* A placeholder is a summary: no description until the real issue lands. */}
          {'description' in issue ? (
            <p data-testid="detail-description">{issue.description}</p>
          ) : (
            <p className="muted">Loading the description…</p>
          )}
        </>
      )}
    </aside>
  );
}
