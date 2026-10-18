import { useState } from 'react';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import { getPeople } from '../api/client';
import { filterPeople } from '../utils/filterPeople';

export function peopleLoader({ request }: { request: Request }) {
  return getPeople(request.signal);
}

export function PeoplePage() {
  const people = useLoaderData<typeof peopleLoader>();
  const [searchParams, setSearchParams] = useSearchParams();
  // The input owns its value; the URL only mirrors it. Reading the value back
  // from `searchParams` drops keystrokes: each `setSearchParams` is a
  // navigation, and a fast typist (or `cy.type`) outruns it.
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const visible = filterPeople(people, query);

  return (
    <section>
      <h2>People</h2>
      <label htmlFor="filter">Filter by name</label>
      <input
        id="filter"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setSearchParams(event.target.value ? { q: event.target.value } : {}, { replace: true });
        }}
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
