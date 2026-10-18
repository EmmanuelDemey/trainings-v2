import { data, useLoaderData, useNavigate, type LoaderFunctionArgs } from 'react-router';
import { fetchPerson } from '../api/people';

export async function personLoader({ params, request }: LoaderFunctionArgs) {
  // `:id` in the path → `params.id`. Always a string, never a number.
  const person = await fetchPerson(params.id!, request.signal);
  if (!person) {
    // Thrown, not returned: the route's error element renders instead of the
    // page, and `useRouteError()` gives it this response, status included.
    throw data(`No person with id ${params.id}.`, { status: 404 });
  }
  return person;
}

export function PersonPage() {
  const person = useLoaderData<typeof personLoader>();
  const navigate = useNavigate();

  return (
    <article aria-labelledby="person-name">
      <h1 id="person-name">{person.name}</h1>
      <dl>
        <dt>Height</dt>
        <dd>{person.height} cm</dd>
        <dt>Mass</dt>
        <dd>{person.mass} kg</dd>
        <dt>Birth year</dt>
        <dd>{person.birthYear}</dd>
      </dl>
      {/* Back in history, like the browser button — the filter comes back too. */}
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </article>
  );
}
