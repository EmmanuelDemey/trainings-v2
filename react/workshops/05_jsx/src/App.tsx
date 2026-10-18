import { PeopleTable } from './components/PeopleTable';
import { people } from './data/people';

export function App() {
  // TODO 1.1: replace the <div> by a fragment holding a <header> and a <main>.
  // TODO 1.2: in the <header>, interpolate the title and the number of people:
  //           "10 characters from a galaxy far, far away."
  // TODO 5.1: above the table, a "Search a character" label tied to an
  //           <input type="search"> — mind the attribute names.
  return (
    <div>
      <h1>Star Wars people</h1>
      <PeopleTable people={people} />
    </div>
  );
}
