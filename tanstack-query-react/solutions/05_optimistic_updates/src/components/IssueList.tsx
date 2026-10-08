import { useQuery } from '@tanstack/react-query';
import type { IssueSummary } from '../api/fakeApi';
import { issuesQuery, useSetIssueStatus } from '../queries/issues';
import { NewIssueForm } from './NewIssueForm';

export function IssueList() {
  const { data: issues, isPending, error } = useQuery(issuesQuery('open'));
  const statusChange = useSetIssueStatus();

  function toggle(issue: IssueSummary): void {
    statusChange.mutate({ id: issue.id, status: issue.status === 'open' ? 'closed' : 'open' });
  }

  return (
    <section>
      <h2>Open issues</h2>

      {/* Shown after the rollback: the issue is back, and the user is told why. */}
      {statusChange.error && (
        <p className="error" data-testid="toggle-error">
          {statusChange.error.message}
        </p>
      )}

      {error ? (
        <p className="error" data-testid="list-error">
          {error.message}
        </p>
      ) : isPending ? (
        <p className="muted" data-testid="list-loading">
          Loading…
        </p>
      ) : (
        <ul className="issues">
          {issues.map((issue) => (
            <li key={issue.id} data-testid={`issue-${issue.id}`}>
              <span>
                #{issue.id} {issue.title}
              </span>
              <button type="button" data-testid={`toggle-${issue.id}`} onClick={() => toggle(issue)}>
                {issue.status === 'open' ? 'Close' : 'Reopen'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <NewIssueForm />
    </section>
  );
}
