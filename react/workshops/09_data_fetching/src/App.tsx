import { useState } from 'react';
import { PeopleTableContainer } from './people/PeopleTableContainer';
import { PersonContainer } from './people/PersonContainer';
import './App.css';

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main className="app">
      <h1>Star Wars people</h1>
      <div className="layout">
        <section aria-label="Characters">
          <PeopleTableContainer selectedId={selectedId} onSelect={setSelectedId} />
        </section>
        <section aria-label="Details">
          {selectedId ? (
            <PersonContainer id={selectedId} />
          ) : (
            <p>Select a character to see the details.</p>
          )}
        </section>
      </div>
    </main>
  );
}
