import { useState } from 'react';
import { Button } from './components/Button/Button';
import { Input } from './components/Input/Input';
import { PeopleTable } from './components/PeopleTable/PeopleTable';
import { people } from './data/people';
import type { Person } from './model/person';

export function App() {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Person | null>(null);
  const visible = people.filter((person) => person.name.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <main>
      <h1>Star Wars people</h1>
      <Input label="Filter by name" value={filter} onChange={(event) => setFilter(event.target.value)} />
      <PeopleTable people={visible} onSelect={setSelected} />
      {selected && (
        <p>
          Selected: <strong>{selected.name}</strong>{' '}
          <Button variant="secondary" size="small" onClick={() => setSelected(null)}>
            Clear
          </Button>
        </p>
      )}
    </main>
  );
}
