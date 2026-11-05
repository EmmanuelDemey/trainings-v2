import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { getJson } from '../api/http';
import type { Person } from '../model/person';

export async function peopleLoader({ request }: LoaderFunctionArgs) {
  // TODO 3.3: `await requireUser(request)` first — before any request is sent.
  return getJson<Pick<Person, 'id' | 'name'>[]>('/api/people', request.signal);
}

export function PeoplePage() {
  const people = useLoaderData<typeof peopleLoader>();
  return (
    <section aria-labelledby="people-title">
      <h1 id="people-title">People</h1>
      <ul className="people">
        {people.map((person) => (
          <li key={person.id}>
            <Link to={`/people/${person.id}`}>{person.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
