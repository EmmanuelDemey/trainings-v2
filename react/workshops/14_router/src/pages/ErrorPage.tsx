import { Link } from 'react-router';

export function ErrorPage() {
  // TODO 5.1: read the error with `useRouteError()`.
  //   - `isRouteErrorResponse(error)`: a thrown `data(…, { status })`. Render
  //     "Not found" as the <h1> for a 404 (`Error ${status}` otherwise), and
  //     `error.data` — the message the loader passed to `data()` — when it is a string.
  //   - anything else: keep "Something went wrong", plus `error.message`.
  return (
    <section role="alert">
      <h1>Something went wrong</h1>
      <Link to="/">Back to the people</Link>
    </section>
  );
}
