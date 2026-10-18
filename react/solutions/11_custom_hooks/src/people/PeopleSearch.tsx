import { useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFetch } from '../hooks/useFetch';
import type { Person } from '../model/person';
import { FavoriteButton } from './FavoriteButton';

export function PeopleSearch() {
  const [query, setQuery] = useState('');
  // The input follows every keystroke; the request only the settled value.
  const search = useDebouncedValue(query.trim(), 300);
  const { data: people, loading, error } = useFetch<Person[]>(
    `/api/people?search=${encodeURIComponent(search)}`,
  );

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
