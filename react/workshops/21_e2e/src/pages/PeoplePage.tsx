import { Link, useLoaderData, useSearchParams } from 'react-router';
import { getPeople } from '../api/client';
import { filterPeople } from '../utils/filterPeople';

export function peopleLoader({ request }: { request: Request }) {
  return getPeople(request.signal);
}

export function PeoplePage() {
  const people = useLoaderData<typeof peopleLoader>();
  const [searchParams, setSearchParams] = useSearchParams();
  // TODO 3.4: your filter test is red, and your test is right — read the
  // README. The input's value comes from the URL, and `setSearchParams` is a
  // navigation: a fast typist outruns it.
  const query = searchParams.get('q') ?? '';
  const visible = filterPeople(people, query);

  return (
    <section>
      <h2>People</h2>
      <label htmlFor="filter">Filter by name</label>
      <input
        id="filter"
        type="search"
        value={query}
        onChange={(event) =>
          setSearchParams(event.target.value ? { q: event.target.value } : {}, { replace: true })
        }
      />
      {visible.length === 0 ? (
        <p role="status">No people match “{query}”.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Gender</th>
              <th scope="col">Birth year</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((person) => (
              <tr key={person.id}>
                <td>
                  <Link to={`/people/${person.id}`}>{person.name}</Link>
                </td>
                <td>{person.gender}</td>
                <td>{person.birthYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
