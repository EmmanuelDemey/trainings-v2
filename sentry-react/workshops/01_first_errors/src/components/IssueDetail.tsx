import { useEffect, useState } from 'react';
import { fetchIssue } from '../api/client';
import type { Issue } from '../api/fakeServer';
import { Avatar } from './Avatar';

type State = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; issue: Issue };

export function IssueDetail({ id }: { readonly id: number }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let ignore = false;
    setState({ status: 'loading' });
    fetchIssue(id)
      .then((issue) => {
        if (!ignore) setState({ status: 'success', issue });
      })
      .catch((error: Error) => {
        if (ignore) return;
        // TODO (step 4): this error is handled by the UI below, so neither React
        // nor the browser ever sees it. Report it: `Sentry.captureException(error)`.
        setState({ status: 'error', error });
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  if (state.status === 'loading') return <p className="muted">Loading issue #{id}…</p>;
  if (state.status === 'error') {
    return (
      <p className="error" data-testid="detail-error">
        Could not load issue #{id}: {state.error.message}
      </p>
    );
  }

  const { issue } = state;
  return (
    <section data-testid="issue-detail">
      <h2 data-testid="detail-title">
        #{issue.id} {issue.title}
      </h2>
      <p>{issue.description}</p>
      <p className="row">
        {/* Issue 7 has no assignee: this line throws while rendering. */}
        <Avatar login={issue.assignee.login} /> {issue.assignee.name}
      </p>
    </section>
  );
}
