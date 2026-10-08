import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { IssueFilter } from '../api/fakeApi';
import { issuesQuery } from '../queries/issues';

const FILTERS: IssueFilter[] = ['open', 'closed', 'all'];

interface IssueListProps {
  selectedId: number | undefined;
  onSelect: (id: number) => void;
}

export function IssueList({ selectedId, onSelect }: IssueListProps) {
  const [filter, setFilter] = useState<IssueFilter>('open');

  // The key is rebuilt from `filter` on every render: when it changes,
  // `useQuery` switches to another entry of the cache — fetched if missing,
  // shown at once if already there. No effect, no dependency array.
  const { data: issues, isPending, isFetching, error } = useQuery(issuesQuery(filter));

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
        {/* `isFetching`: a request is in flight, maybe behind data already on
            screen. `!isPending` keeps it for the "refreshing" case only. */}
        {isFetching && !isPending && (
          <span className="muted" data-testid="list-refreshing">
            refreshing…
          </span>
        )}
      </div>

      {error ? (
        <p className="error" data-testid="list-error">
          {error.message}
        </p>
      ) : isPending ? (
        // `isPending`: nothing to show yet, for THIS key. Coming back to a
        // filter already in the cache is never pending again.
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
              <button
                type="button"
                data-testid={`select-${issue.id}`}
                aria-pressed={selectedId === issue.id}
                onClick={() => onSelect(issue.id)}
              >
                Details
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
