import { useQuery } from '@tanstack/react-query';
import { issuesQuery } from '../queries/issues';

/**
 * The header counter. It asks for exactly what the list asks for on load —
 * the same key — so both read ONE entry of the cache, filled by ONE request.
 * Neither component knows the other exists.
 */
export function IssueCounter() {
  const { data: issues } = useQuery(issuesQuery('open'));

  return (
    <span className="counter" data-testid="open-count">
      {issues ? issues.length : '…'} open
    </span>
  );
}
