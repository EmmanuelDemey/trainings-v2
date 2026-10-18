import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

export function ErrorPage() {
  // Whatever a loader threw, or a component threw while rendering.
  const error = useRouteError();

  // A thrown `data(…, { status })` (or Response): an expected HTTP-like error.
  if (isRouteErrorResponse(error)) {
    return (
      <section role="alert">
        <h1>{error.status === 404 ? 'Not found' : `Error ${error.status}`}</h1>
        {/* `error.data` is whatever the loader passed to `data()`: a string here. */}
        {typeof error.data === 'string' && <p>{error.data}</p>}
        <Link to="/">Back to the people</Link>
      </section>
    );
  }

  // Anything else is a bug or an outage: say so, without the stack trace.
  return (
    <section role="alert">
      <h1>Something went wrong</h1>
      <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
      <Link to="/">Back to the people</Link>
    </section>
  );
}
