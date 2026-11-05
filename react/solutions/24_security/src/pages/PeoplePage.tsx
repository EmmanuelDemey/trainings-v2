import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { getJson } from '../api/http';
import { requireUser } from '../auth/guards';
import type { Person } from '../model/person';

export async function peopleLoader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
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
