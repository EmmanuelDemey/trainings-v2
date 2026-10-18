import type { Person } from '../model/person';
import { LikeButton } from './LikeButton';

interface PeopleTableProps {
  people: Person[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLiked: (id: string) => void;
}

export function PeopleTable({ people, selectedId, onSelect, onLiked }: PeopleTableProps) {
  return (
    <table>
      <caption>Star Wars characters</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Birth year</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
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
            <td>{person.birthYear}</td>
            <td>
              <LikeButton person={person} onLiked={onLiked} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
