import { useState } from 'react';
import { CreatePersonActionForm } from './components/ActionForm';
import { CreatePersonHookForm } from './components/HookForm';
import type { Person } from './model/person';

export function App() {
  const [created, setCreated] = useState<Person[]>([]);
  const add = (person: Person) => setCreated((current) => [...current, person]);

  return (
    <main>
      <h1>Create a Star Wars person</h1>
      <div className="forms">
        <CreatePersonActionForm onCreated={add} />
        <CreatePersonHookForm onCreated={add} />
      </div>

      <h2 id="created-title">Created people</h2>
      {created.length === 0 ? (
        <p>Nobody yet — submit one of the forms.</p>
      ) : (
        <ul aria-labelledby="created-title">
          {created.map((person) => (
            <li key={person.id}>
              {person.name} — {person.height} cm, born {person.birthYear}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
