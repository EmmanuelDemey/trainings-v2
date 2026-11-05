import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { fetchIssues, type Filter, type IssueSummary } from '../api/client';

const FILTERS: Filter[] = ['open', 'closed', 'all'];

interface IssueListProps {
  readonly selectedId: number | null;
  readonly onOpen: (id: number) => void;
}

export function IssueList({ selectedId, onOpen }: IssueListProps) {
  const [filter, setFilter] = useState<Filter>('open');
  const [issues, setIssues] = useState<IssueSummary[] | null>(null);

  function changeFilter(next: Filter) {
    // What the user did before the error: the next event carries it.
    Sentry.addBreadcrumb({ category: 'ui.filter', message: `filter: ${next}`, data: { filter: next } });
    setFilter(next);
  }

  useEffect(() => {
    let ignore = false;
    setIssues(null);
    fetchIssues(filter).then((data) => {
      if (!ignore) setIssues(data);
    });
    return () => {
      ignore = true;
    };
  }, [filter]);

  return (
    <section className="panel">
      <div className="row">
        {FILTERS.map((name) => (
          <button key={name} data-testid={`filter-${name}`} aria-selected={filter === name} onClick={() => changeFilter(name)}>
            {name}
          </button>
        ))}
      </div>
      {issues === null ? (
        <p className="muted">Loading…</p>
      ) : (
        <ul className="issues">
          {issues.map((issue) => (
            <li key={issue.id} data-testid={`issue-${issue.id}`}>
              <span className={issue.status === 'closed' ? 'closed' : undefined}>
                #{issue.id} {issue.title}
              </span>
              <button data-testid={`open-${issue.id}`} aria-selected={selectedId === issue.id} onClick={() => onOpen(issue.id)}>
                Open
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
