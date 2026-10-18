import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

export function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <section>
        <h2>Not found</h2>
        <p>{typeof error.data === 'string' ? error.data : 'This page does not exist.'}</p>
        <Link to="/">Back to the list</Link>
      </section>
    );
  }

  return (
    <section role="alert">
      <h2>Something went wrong</h2>
      <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
      <Link to="/">Back to the list</Link>
    </section>
  );
}
