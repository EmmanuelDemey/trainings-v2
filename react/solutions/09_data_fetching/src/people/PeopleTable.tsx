import type { Person } from '../model/person';

interface PeopleTableProps {
  people: Person[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

/** A presentational table: it renders what it is given and knows nothing about HTTP. */
export function PeopleTable({ people, selectedId, onSelect }: PeopleTableProps) {
  return (
    <table className="people-table">
      <caption>Star Wars characters</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Height</th>
          <th scope="col">Mass</th>
          <th scope="col">Birth year</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id} aria-selected={person.id === selectedId}>
            <th scope="row">
              <button type="button" className="link" onClick={() => onSelect(person.id)}>
                {person.name}
              </button>
            </th>
            <td>{person.height} cm</td>
            <td>{person.mass} kg</td>
            <td>{person.birthYear}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
