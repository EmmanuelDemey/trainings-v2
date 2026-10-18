import { useState } from 'react';
import { Link, useLoaderData, useSearchParams, type LoaderFunctionArgs } from 'react-router';
import { fetchPeople } from '../api/people';

/**
 * Runs BEFORE the page renders, on every navigation to it — including a change
 * of `?q=`. The filter lives in the URL, so the loader reads it from there.
 */
export async function peopleLoader({ request }: LoaderFunctionArgs) {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  // `request.signal` aborts the fetch when the user navigates away first.
  return fetchPeople(q, request.signal);
}

export function PeoplePage() {
  // `typeof peopleLoader` types the data from the loader's return type.
  const people = useLoaderData<typeof peopleLoader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  // The input needs its own state: `searchParams` only changes once the
  // navigation is DONE — after the loader ran. Bound to `q` directly, the input
  // would lag behind the keyboard and drop keystrokes.
  const [query, setQuery] = useState(q);

  return (
    <section aria-labelledby="people-title">
      <h1 id="people-title">People</h1>
      <label>
        Filter
        <input
          type="search"
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            // `replace`: one history entry per keystroke would make "Back"
            // useless. An empty filter leaves the URL clean.
            setSearchParams(value ? { q: value } : {}, { replace: true });
          }}
        />
      </label>
      {people.length === 0 ? (
        <p>Nobody matches “{q}”.</p>
      ) : (
        <ul className="people">
          {people.map((person) => (
            <li key={person.id}>
              {/* A relative link: resolved against the current route, "/". */}
              <Link to={`people/${person.id}`}>{person.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
