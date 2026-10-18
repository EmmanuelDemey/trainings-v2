import { PeopleTable } from './components/PeopleTable';
import { people } from './data/people';

const title = 'Star Wars people';

export function App() {
  // A component returns ONE node. The fragment groups <header> and <main>
  // without adding a useless <div> to the DOM.
  return (
    <>
      <header>
        {/* `{ }` interpolates any JavaScript expression. */}
        <h1>{title}</h1>
        <p>{people.length} characters from a galaxy far, far away.</p>
      </header>
      <main>
        <div className="search">
          {/* `htmlFor`, not `for` — another reserved word. It is what ties the
              label to the input: click the label, the input gets the focus. */}
          <label htmlFor="search">Search a character</label>
          <input id="search" type="search" placeholder="Luke…" />
        </div>
        <PeopleTable people={people} />
      </main>
    </>
  );
}
