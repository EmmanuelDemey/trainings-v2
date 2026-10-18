import type { Person } from '../../model/person';
import './PeopleTable.css';

export interface PeopleTableProps {
  people: Person[];
  /** Called with the person whose name was clicked. */
  onSelect?: (person: Person) => void;
  loading?: boolean;
}

export function PeopleTable({ people, onSelect, loading = false }: PeopleTableProps) {
  if (loading) return <p role="status">Loading people…</p>;
  if (people.length === 0) return <p role="status">No people found</p>;

  return (
    <table className="people-table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Gender</th>
          <th scope="col">Birth year</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id}>
            <td>
              <button type="button" className="people-table__name" onClick={() => onSelect?.(person)}>
                {person.name}
              </button>
            </td>
            <td>{person.gender}</td>
            <td>{person.birthYear}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
