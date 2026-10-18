import type { Person } from '../model/person';
import { formatHeight } from '../utils/format';

type PeopleTableProps = {
  people: Person[];
  onSelect: (personId: string) => void;
};

export function PeopleTable({ people, onSelect }: PeopleTableProps) {
  if (people.length === 0) {
    return <p role="status">No character matches.</p>;
  }

  return (
    <table className="people-table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Birth year</th>
          <th scope="col">Height</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id}>
            <td>
              <button type="button" className="link" onClick={() => onSelect(person.id)}>
                {person.name}
              </button>
            </td>
            <td>{person.birthYear}</td>
            <td>{formatHeight(person.height)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
