import { useState } from 'react';
import { IssueCounter } from './components/IssueCounter';
import { IssueDetail } from './components/IssueDetail';
import { IssueList } from './components/IssueList';

export function App() {
  // Client state — which issue the user looks at — stays in React. Only the
  // server state goes to the cache.
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <>
      <header className="header">
        <h1>Issue tracker</h1>
        <IssueCounter />
      </header>
      <main className="columns">
        <IssueList selectedId={selectedId} onSelect={setSelectedId} />
        <IssueDetail id={selectedId} />
      </main>
    </>
  );
}
