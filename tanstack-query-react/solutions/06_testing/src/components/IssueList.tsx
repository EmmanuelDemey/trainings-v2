import { useQuery } from '@tanstack/react-query';
import { issuesQuery, useDeleteIssue } from '../queries/issues';
import { NewIssueForm } from './NewIssueForm';

export function IssueList() {
  const { data: issues, isPending, error } = useQuery(issuesQuery('open'));
  // One mutation for every row: `variables` says which issue is on its way out.
  const deletion = useDeleteIssue();

  return (
    <section>
      <h2>Open issues</h2>

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
              <button
                type="button"
                data-testid={`delete-${issue.id}`}
                disabled={deletion.isPending && deletion.variables === issue.id}
                onClick={() => deletion.mutate(issue.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      {deletion.error && <p className="error">{deletion.error.message}</p>}

      <NewIssueForm />
    </section>
  );
}
