import { useState } from 'react';
import { Card } from './components/Card';
import { Highlight } from './components/Highlight';
import { PeopleFilter } from './components/PeopleFilter';
import { PeopleTable } from './components/PeopleTable';
import { Title } from './components/Title';
import { people } from './data/people';
import { filterPeople } from './utils/filterPeople';

export function App() {
  // The filter lives HERE, in the closest common parent of the two components
  // that need it: PeopleFilter writes it, PeopleTable reads its result. The
  // data flows down through props, the changes flow up through a callback.
  const [query, setQuery] = useState('');
  const visiblePeople = filterPeople(people, query);

  return (
    <>
      <Title text="Star Wars people" />
      <Card title="Search">
        <PeopleFilter value={query} onChange={setQuery} />
      </Card>
      <Card title="Characters" footer={`${visiblePeople.length} of ${people.length} characters`}>
        <PeopleTable
          people={visiblePeople}
          renderName={(person) => <Highlight text={person.name} query={query} />}
        />
      </Card>
    </>
  );
}
