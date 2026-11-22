import { useQuery } from '@tanstack/react-query';
import { issuesQuery } from '../queries/issues';

/**
 * The header counter. Same key as the list — and nobody tells it about a new
 * or a deleted issue: the invalidation of `issueKeys.all` does.
 */
export function IssueCounter() {
  const { data: count } = useQuery({
    ...issuesQuery('open'),
    select: (issues) => issues.length,
  });

  return (
    <span className="counter" data-testid="open-count">
      {count ?? '…'} open
    </span>
  );
}
