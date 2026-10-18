import { useState } from 'react';
import { PeopleTable } from './components/PeopleTable';
import { RandomPerson } from './components/RandomPerson';
import { people } from './data/people';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { filterPeople } from './utils/filterPeople';

export const SEARCH_DELAY = 300;

export function App() {
  const [query, setQuery] = useState('');
  // The table only follows the input once the user stops typing.
  const debouncedQuery = useDebouncedValue(query, SEARCH_DELAY);

  return (
    <main>
      <h1>Star Wars people</h1>
      <label htmlFor="search">Search</label>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <PeopleTable people={filterPeople(people, debouncedQuery)} />
      <RandomPerson people={people} />
    </main>
  );
}
