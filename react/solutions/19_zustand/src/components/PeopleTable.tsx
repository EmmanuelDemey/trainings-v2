import type { Person } from '../model/person';
import { LikeButton } from './LikeButton';

interface PeopleTableProps {
  people: Person[];
}

export function PeopleTable({ people }: PeopleTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Gender</th>
          <th scope="col">Birth year</th>
          <th scope="col">Like</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id}>
            <td>{person.name}</td>
            <td>{person.gender}</td>
            <td>{person.birthYear}</td>
            <td>
              <LikeButton person={person} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
