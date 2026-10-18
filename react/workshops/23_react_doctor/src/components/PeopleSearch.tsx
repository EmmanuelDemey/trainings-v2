import { useEffect, useState } from 'react';
import type { Person } from '../model/person';
import { FavoriteButton } from './FavoriteButton';

interface PeopleSearchProps {
  people: Person[];
  onAdd: (person: Person) => void;
}

export function PeopleSearch({ people, onAdd }: PeopleSearchProps) {
  const [query, setQuery] = useState('');

  // TODO 2.1: `matches` is DERIVED state — it can always be computed from
  //   `people` and `query`. Copying it into a state through an effect means
  //   every keystroke commits twice: once with the stale list, once more when
  //   the effect caught up. Delete the state and the effect, and compute the
  //   list while rendering.
  const [matches, setMatches] = useState<Person[]>(people);
  useEffect(() => {
    const needle = query.trim().toLowerCase();
    setMatches(people.filter((person) => person.name.toLowerCase().includes(needle)));
  }, [people, query]);

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
