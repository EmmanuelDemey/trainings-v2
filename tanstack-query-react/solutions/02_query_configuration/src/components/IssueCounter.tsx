import { useQuery } from '@tanstack/react-query';
import { issuesQuery } from '../queries/issues';

/**
 * The header counter. Same key as the open list: one entry of the cache, one
 * request, two components.
 */
export function IssueCounter() {
  const { data: count } = useQuery({
    ...issuesQuery('open'),
    // (Bonus) The cache keeps the whole list; this component only re-renders
    // when the NUMBER changes.
    select: (issues) => issues.length,
    // Other users close issues too. With `staleTime: 30_000`, a focus inside
    // those 30 s refetches nothing — `true` only refetches STALE queries.
    // `'always'` refetches this one on every focus, fresh or not.
    refetchOnWindowFocus: 'always',
  });

  return (
    <span className="counter" data-testid="open-count">
      {count ?? '…'} open
    </span>
  );
}
