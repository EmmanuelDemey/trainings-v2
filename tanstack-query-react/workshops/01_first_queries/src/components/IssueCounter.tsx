import { useEffect, useState } from 'react';
import { fetchIssues } from '../api/fakeApi';

/**
 * The header counter, fetching the way most apps start: an effect and a piece
 * of state. It needs the open issues — and so does the list, which fetches its
 * own copy. Two components, two requests for the same data.
 */
export function IssueCounter() {
  const [count, setCount] = useState<number | null>(null);

  // TODO (step 2): replace this effect and this state with
  // `useQuery(issuesQuery('open'))`, and show `data.length`.
  useEffect(() => {
    fetchIssues('open')
      .then((issues) => setCount(issues.length))
      .catch(() => setCount(null));
  }, []);

  return (
    <span className="counter" data-testid="open-count">
      {count ?? '…'} open
    </span>
  );
}
