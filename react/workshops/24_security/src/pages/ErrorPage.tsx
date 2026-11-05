import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { UnauthorizedError } from '../api/http';

export function ErrorPage() {
  const error = useRouteError();

  if (error instanceof UnauthorizedError) {
    return (
      <section role="alert">
        <h1>Session expired</h1>
        <p>{error.message}</p>
        <Link to="/login">Log in</Link>
      </section>
    );
  }

  if (isRouteErrorResponse(error)) {
    return (
      <section role="alert">
        <h1>{error.status === 403 ? 'Access denied' : `Error ${error.status}`}</h1>
        {typeof error.data === 'string' && <p>{error.data}</p>}
        <Link to="/">Back to the people</Link>
      </section>
    );
  }

  // A bug or an outage: say so, without the stack trace.
  return (
    <section role="alert">
      <h1>Something went wrong</h1>
      <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
    </section>
  );
}
