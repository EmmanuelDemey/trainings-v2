import { useState } from 'react';
import { people } from './data/people';
import { PeopleFilter } from './people/PeopleFilter';
import { PeopleTable } from './people/PeopleTable';
import { PersonCard } from './people/PersonCard';
import './App.css';

export function App() {
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<ReadonlySet<string>>(new Set());

  const query = filter.trim().toLowerCase();
  const visiblePeople = people.filter(({ name }) => name.toLowerCase().includes(query));
  const selected = people.find(({ id }) => id === selectedId);

  return (
    <main className="app">
      <h1>Star Wars people</h1>
      <p>Liked characters: {likedIds.size}</p>

      {/* TODO 2.1: type "order 66" in the filter: the whole page goes blank.
          Wrap the filter in an <ErrorBoundary> whose fallback is a `role="alert"`
          saying "The filter crashed: <message>", with a "Reset the filter" button.
          TODO 2.2: make the reset clear the filter (`onReset`) — or it crashes again. */}
      <PeopleFilter value={filter} onChange={setFilter} />

      <div className="layout">
        <PeopleTable
          people={visiblePeople}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onLiked={(id) => setLikedIds((liked) => new Set(liked).add(id))}
        />
        <section aria-label="Details">
          {/* TODO 3.3: select IG-88. Wrap the card in an <ErrorBoundary> whose
              fallback says "This character cannot be displayed.", reset by
              `resetKeys` when another character is selected. */}
          {selected ? <PersonCard person={selected} /> : <p>Select a character to see the details.</p>}
        </section>
      </div>
    </main>
  );
}
