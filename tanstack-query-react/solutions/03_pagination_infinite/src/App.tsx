import { ActivityFeed } from './components/ActivityFeed';
import { IssueTable } from './components/IssueTable';

export function App() {
  return (
    <>
      <header className="header">
        <h1>Issue tracker</h1>
      </header>
      <main className="columns">
        <IssueTable />
        <ActivityFeed />
      </main>
    </>
  );
}
