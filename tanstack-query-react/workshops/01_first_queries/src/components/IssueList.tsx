import { useEffect, useState } from 'react';
import { fetchIssues, type IssueFilter, type IssueSummary } from '../api/fakeApi';

const FILTERS: IssueFilter[] = ['open', 'closed', 'all'];

export function IssueList() {
  const [filter, setFilter] = useState<IssueFilter>('open');

  // TODO (step 2): three pieces of state, an effect and a try/finally — all of
  // it becomes ONE `useQuery(issuesQuery(filter))` (step 3: the key follows
  // `filter`). Read `data`, `isPending`, `isFetching` and `error` from it.
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      // Every filter change starts from scratch: what was loaded a second ago
      // for this filter is gone, and "Loading…" shows again.
      setLoading(true);
      setError(null);
      try {
        // No way to ignore an answer that comes too late: a slow filter that
        // answers after a fast one overwrites it.
        setIssues(await fetchIssues(filter));
      } catch (caught) {
        setError(caught as Error);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [filter]);

  return (
    <section>
      <div className="row" role="tablist" aria-label="Filter the issues">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={filter === option}
            data-testid={`filter-${option}`}
            onClick={() => setFilter(option)}
          >
            {option}
          </button>
        ))}
        {/* TODO (step 4): show this hint while a request is in flight BEHIND data
            already on screen — `isFetching && !isPending`. */}
      </div>

      {error ? (
        <p className="error" data-testid="list-error">
          {error.message}
        </p>
      ) : loading ? (
        // TODO (step 4): only while there is nothing to show yet — `isPending`.
        <p className="muted" data-testid="list-loading">
          Loading…
        </p>
      ) : (
        <ul className="issues">
          {issues.map((issue) => (
            <li key={issue.id} data-testid={`issue-${issue.id}`}>
              <span className={issue.status === 'closed' ? 'closed' : undefined}>
                #{issue.id} {issue.title}
              </span>
              <span className="muted">{issue.assignee ?? 'unassigned'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
