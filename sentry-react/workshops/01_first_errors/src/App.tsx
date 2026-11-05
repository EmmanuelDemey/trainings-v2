import { useState } from 'react';
import { ADA, type CurrentUser } from './auth';
import { Header } from './components/Header';
import { IssueDetail } from './components/IssueDetail';
import { IssueList } from './components/IssueList';
import { useHealthCheck } from './hooks';

export function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  useHealthCheck();

  return (
    <>
      <Header user={user} onLogin={() => setUser(ADA)} onLogout={() => setUser(null)} />
      <main className="layout">
        <IssueList selectedId={selectedId} onOpen={setSelectedId} />
        <div className="panel">
          {selectedId === null ? (
            <p className="muted">Open an issue to see its details.</p>
          ) : (
            // TODO (step 2): wrap the detail in a <Sentry.ErrorBoundary key={selectedId}>
            // whose `fallback` renders <ErrorFallback eventId={…} resetError={…} />
            // (./components/ErrorFallback). Without it, a crash here blanks the page.
            <IssueDetail id={selectedId} />
          )}
        </div>
      </main>
    </>
  );
}
