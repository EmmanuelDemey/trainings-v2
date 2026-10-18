import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
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

      {/* One boundary per independent widget: the filter can die alone. */}
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <div role="alert" className="fallback">
            <p>The filter crashed: {error.message}</p>
            <button type="button" onClick={reset}>
              Reset the filter
            </button>
          </div>
        )}
        // Resetting without fixing the cause would render "order 66" again and
        // throw again: the reset clears the value that made it crash.
        onReset={() => setFilter('')}
      >
        <PeopleFilter value={filter} onChange={setFilter} />
      </ErrorBoundary>

      <div className="layout">
        <PeopleTable
          people={visiblePeople}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onLiked={(id) => setLikedIds((liked) => new Set(liked).add(id))}
        />
        <section aria-label="Details">
          {selected ? (
            // Selecting another character is the reset: no button needed.
            <ErrorBoundary
              resetKeys={[selected.id]}
              fallback={() => (
                <p role="alert" className="fallback">
                  This character cannot be displayed.
                </p>
              )}
            >
              <PersonCard person={selected} />
            </ErrorBoundary>
          ) : (
            <p>Select a character to see the details.</p>
          )}
        </section>
      </div>
    </main>
  );
}
