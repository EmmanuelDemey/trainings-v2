import { useState } from 'react';
import type { Person } from '../model/person';
import { FavoriteButton } from './FavoriteButton';

interface PeopleSearchProps {
  people: Person[];
  onAdd: (person: Person) => void;
}

export function PeopleSearch({ people, onAdd }: PeopleSearchProps) {
  const [query, setQuery] = useState('');

  // Derived, not stored: the list is a function of `people` and `query`, so it
  // is computed while rendering and is never out of date — not even for one
  // commit. Filtering six names costs nothing; reach for `useMemo` only once a
  // profiler says it is slow.
  const needle = query.trim().toLowerCase();
  const matches = people.filter((person) => person.name.toLowerCase().includes(needle));

  return (
    <section aria-labelledby="search-title">
      <h2 id="search-title">Search</h2>
      <label htmlFor="search">Search by name</label>
      <input id="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      {matches.length === 0 ? (
        <p>Nobody matches “{query}”.</p>
      ) : (
        <ul aria-label="Matching people">
          {matches.map((person) => (
            <li key={person.id}>
              {person.name} <FavoriteButton person={person} onAdd={onAdd} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
