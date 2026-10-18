import { useState } from 'react';
import { people as allPeople } from '../data/people';

// TODO 2.1: export a `peopleLoader({ request }: LoaderFunctionArgs)` that reads
//   `q` from `new URL(request.url).searchParams` and returns
//   `fetchPeople(q, request.signal)` (from '../api/people').

export function PeoplePage() {
  // TODO 2.2: the people come from the loader: `useLoaderData<typeof peopleLoader>()`.
  //
  // TODO 4.1: the filter must live in the URL (`?q=dar`), so that it survives a
  //   reload and "Back". Read it with `useSearchParams()`, write it with
  //   `setSearchParams(value ? { q: value } : {}, { replace: true })`, and let
  //   the loader do the filtering. Keep a local state for the input's value —
  //   initialised from `q` (the README explains why).
  const [query, setQuery] = useState('');
  const people = allPeople.filter(({ name }) => name.toLowerCase().includes(query.toLowerCase()));

  return (
    <section aria-labelledby="people-title">
      <h1 id="people-title">People</h1>
      <label>
        Filter
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {people.length === 0 ? (
        <p>Nobody matches “{query}”.</p>
      ) : (
        <ul className="people">
          {people.map((person) => (
            // TODO 3.1: make the name a <Link> to `people/${person.id}`.
            <li key={person.id}>{person.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
