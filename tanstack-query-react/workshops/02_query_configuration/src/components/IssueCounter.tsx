import { useQuery } from '@tanstack/react-query';
import { issuesQuery } from '../queries/issues';

/**
 * The header counter. Same key as the open list: one entry of the cache, one
 * request, two components.
 */
export function IssueCounter() {
  // TODO (step 4): other users close issues too. Once `staleTime` is 30 s, a
  // focus refetches nothing for 30 s — add `refetchOnWindowFocus: 'always'` to
  // THIS query only: `useQuery({ ...issuesQuery('open'), refetchOnWindowFocus: 'always' })`.
  // (Bonus) `select: (issues) => issues.length`.
  const { data: issues } = useQuery(issuesQuery('open'));

  return (
    <span className="counter" data-testid="open-count">
      {issues ? issues.length : '…'} open
    </span>
  );
}
