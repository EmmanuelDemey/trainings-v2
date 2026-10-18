import { Link, data, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { ApiError, getPerson } from '../api/client';

export async function personLoader({ params, request }: LoaderFunctionArgs) {
  try {
    return await getPerson(params.id ?? '', request.signal);
  } catch (error) {
    // A 404 from the API is a 404 page, not a crash: the route's error element
    // tells them apart with `isRouteErrorResponse`.
    if (error instanceof ApiError && error.status === 404) {
      throw data('Person not found', { status: 404 });
    }
    throw error;
  }
}

export function PersonPage() {
  const person = useLoaderData<typeof personLoader>();

  return (
    <article>
      <h2>{person.name}</h2>
      <dl>
        <dt>Height</dt>
        <dd>{person.height} cm</dd>
        <dt>Mass</dt>
        <dd>{person.mass} kg</dd>
        <dt>Gender</dt>
        <dd>{person.gender}</dd>
        <dt>Birth year</dt>
        <dd>{person.birthYear}</dd>
      </dl>
      <Link to="/">Back to the list</Link>
    </article>
  );
}
