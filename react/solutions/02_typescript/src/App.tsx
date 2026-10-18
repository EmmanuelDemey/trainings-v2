import { groupBy, sortBy } from './collections';
import { people } from './data/people';
import { describeRemoteData, type RemoteData } from './remote-data';
import type { Person } from './model/person';

// A pretend request, already answered: the point is the union, not the network.
const state: RemoteData<Person[]> = { status: 'success', data: people };

export function App() {
  const byGender = groupBy(sortBy(people, 'name'), (person) => person.gender ?? 'unknown');

  return (
    <main>
      <h1>Star Wars people</h1>
      <p>{describeRemoteData(state, (data) => `${data.length} people loaded`)}</p>
      {Object.entries(byGender).map(([gender, group]) => (
        <section key={gender}>
          <h2>{gender}</h2>
          <ul>
            {group?.map((person) => (
              <li key={person.id}>{person.name}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
