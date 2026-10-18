import { LikesCounter } from './components/LikesCounter';
import { PeopleTable } from './components/PeopleTable';
import { ResetLikesButton } from './components/ResetLikesButton';
import { people } from './data/people';

export function App() {
  return (
    <main>
      <header>
        <h1>Star Wars people</h1>
        {/* Siblings of the table, not parents: no prop drilling, no Provider —
            each component reads the store on its own. */}
        <div className="likes-bar">
          <LikesCounter />
          <ResetLikesButton />
        </div>
      </header>
      <PeopleTable people={people} />
    </main>
  );
}
