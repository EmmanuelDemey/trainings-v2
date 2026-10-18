import type { Person } from '../model/person';
import { FavoriteButton } from './FavoriteButton';

interface PersonRowProps {
  person: Person;
}

export function PersonRow({ person }: PersonRowProps) {
  return (
    <tr>
      <th scope="row">{person.name}</th>
      <td>{person.birthYear}</td>
      <td>
        <FavoriteButton person={person} />
      </td>
    </tr>
  );
}
