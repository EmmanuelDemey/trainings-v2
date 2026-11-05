import { useState } from 'react';
import * as Sentry from '@sentry/react';
import { ADA, type CurrentUser } from './auth';
import { ErrorFallback } from './components/ErrorFallback';
import { Header } from './components/Header';
import { IssueDetail } from './components/IssueDetail';
import { IssueList } from './components/IssueList';
import { useHealthCheck } from './hooks';

export function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  useHealthCheck();

  function login(next: CurrentUser | null) {
    setUser(next);
    // The id only: an email is personal data, and the id is enough to find the
    // user in our own back office.
    Sentry.setUser(next ? { id: next.id } : null);
  }

  return (
    <>
      <Header user={user} onLogin={() => login(ADA)} onLogout={() => login(null)} />
      <main className="layout">
        <IssueList selectedId={selectedId} onOpen={setSelectedId} />
        <div className="panel">
          {selectedId === null ? (
            <p className="muted">Open an issue to see its details.</p>
          ) : (
            // `key`: opening another issue starts from a fresh boundary.
            <Sentry.ErrorBoundary
              key={selectedId}
              beforeCapture={(scope) => {
                scope.setTag('issue.id', String(selectedId));
                scope.setContext('issue', { id: selectedId });
              }}
              fallback={({ eventId, resetError }) => <ErrorFallback eventId={eventId} resetError={resetError} />}
            >
              <IssueDetail id={selectedId} />
            </Sentry.ErrorBoundary>
          )}
        </div>
      </main>
    </>
  );
}
