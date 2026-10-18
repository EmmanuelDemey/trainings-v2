import { useState } from 'react';
import { PeopleList } from './components/PeopleList';
import { PersonDetail } from './components/PersonDetail';

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main>
      <h1>Star Wars people</h1>
      <div className="layout">
        <PeopleList selectedId={selectedId} onSelect={setSelectedId} />
        {selectedId === null ? <p>Pick someone in the list.</p> : <PersonDetail id={selectedId} />}
      </div>
    </main>
  );
}
