import { useEffect, useState } from 'react';
import type { Person } from '../model/person';
import { FavoriteButton } from './FavoriteButton';

export function PeopleSearch() {
  const [query, setQuery] = useState('');
  // TODO 2.2: send the request for the settled value only:
  //           `useDebouncedValue(query.trim(), 300)`.
  const search = query.trim();

  // TODO 1.3: everything from here to the end of the effect is what TP 9 wrote
  //           by hand in every container. Move it into `useFetch` (src/hooks),
  //           then replace it with a single
  //           `const { data: people, loading, error } = useFetch<Person[]>(url)`.
  const [people, setPeople] = useState<Person[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/people?search=${encodeURIComponent(search)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        setPeople((await response.json()) as Person[]);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason : new Error(String(reason))))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <section aria-label="Search">
      <p>
        <label htmlFor="search">Search a character</label>{' '}
        <input id="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </p>

      {loading && <p role="status">Loading…</p>}
      {error && <p role="alert">Loading error: {error.message}</p>}

      {people && (
        <ul aria-label="Results" aria-busy={loading}>
          {people.map((person) => (
            <li key={person.id}>
              {person.name} <FavoriteButton person={person} />
            </li>
          ))}
        </ul>
      )}
      {people?.length === 0 && <p>No character matches “{search}”.</p>}
    </section>
  );
}
