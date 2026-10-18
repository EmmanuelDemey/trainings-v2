import type { Person } from '../model/person';
import { FavoriteButton } from './FavoriteButton';

interface PersonRowProps {
  person: Person;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

// TODO 5.3: the row only passes `isFavorite` and `onToggleFavorite` on.
export function PersonRow({ person, isFavorite, onToggleFavorite }: PersonRowProps) {
  return (
    <tr>
      <th scope="row">{person.name}</th>
      <td>{person.birthYear}</td>
      <td>
        <FavoriteButton person={person} pressed={isFavorite} onToggle={onToggleFavorite} />
      </td>
    </tr>
  );
}
