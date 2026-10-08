import { IssueCounter } from './components/IssueCounter';
import { IssueList } from './components/IssueList';
import { SavingIndicator } from './components/SavingIndicator';

export function App() {
  return (
    <>
      <header className="header">
        <h1>Issue tracker</h1>
        <div className="row">
          <SavingIndicator />
          <IssueCounter />
        </div>
      </header>
      <main>
        <IssueList />
      </main>
    </>
  );
}
