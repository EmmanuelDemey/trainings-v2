import { useIssue } from '../queries/issues';

interface IssueDetailProps {
  id: number | undefined;
}

export function IssueDetail({ id }: IssueDetailProps) {
  // Called before any early return: hooks run in the same order on every render.
  const { data: issue, error } = useIssue(id);

  if (id === undefined) {
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
        // A full round trip of "Loading…", though the list already knows the title.
        <p className="muted">Loading…</p>
      ) : (
        <>
          <h2 data-testid="detail-title">
            #{issue.id} {issue.title}
          </h2>
          <p className="muted">
            {issue.status} · {issue.assignee ?? 'unassigned'} · {issue.commentCount} comment(s)
          </p>
          {/* TODO (step 3): a placeholder is a summary, with no description —
              show this paragraph only when `'description' in issue`, and
              "Loading the description…" otherwise. */}
          <p data-testid="detail-description">{issue.description}</p>
        </>
      )}
    </aside>
  );
}
