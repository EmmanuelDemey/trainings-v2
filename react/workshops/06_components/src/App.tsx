import { useState } from 'react';
import { people } from './data/people';
import { filterPeople } from './utils/filterPeople';
import { formatHeight, formatMass } from './utils/format';

// Everything works — and everything is in one component. Your job is to split
// it into the components of `src/components/`, then rebuild this page from them.
export function App() {
  // Given: `useState` is chapter 8. Read it as "a value, and the function that
  // changes it and re-renders the component".
  const [query, setQuery] = useState('');
  const visiblePeople = filterPeople(people, query);

  // TODO 6.1: <Title text="Star Wars people" />.
  // TODO 6.2: a <Card title="Search"> holding a <PeopleFilter> bound to `query`.
  // TODO 6.3: a <Card title="Characters"> holding a <PeopleTable>, with the
  //           footer "3 of 10 characters" (visible count of total count).
  return (
    <>
      <h1 className="title">Star Wars people</h1>
      <div className="card">
        <div className="field">
          <label htmlFor="filter">Filter by name</label>
          <input id="filter" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
      </div>
      <div className="card">
        <table className="people-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Birth year</th>
              <th scope="col">Height</th>
              <th scope="col">Mass</th>
            </tr>
          </thead>
          <tbody>
            {visiblePeople.map((person) => (
              <tr key={person.id}>
                <td>{person.name}</td>
                <td>{person.birthYear}</td>
                <td className="number">{formatHeight(person.height)}</td>
                <td className="number">{formatMass(person.mass)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
