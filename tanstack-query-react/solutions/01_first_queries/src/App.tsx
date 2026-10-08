import { IssueCounter } from './components/IssueCounter';
import { IssueList } from './components/IssueList';

export function App() {
  return (
    <>
      <header className="header">
        <h1>Issue tracker</h1>
        <IssueCounter />
      </header>
      <main>
        <IssueList />
      </main>
    </>
  );
}
