import { people } from '../data/people';
import { PersonRow } from './PersonRow';

interface PeopleTableProps {
  filter: string;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

// TODO 2.2: read the filter with `useFilter()`.
// TODO 5.3: the favorites are only passed on to the rows: drop them.
export function PeopleTable({ filter, favorites, onToggleFavorite }: PeopleTableProps) {
  const query = filter.trim().toLowerCase();
  const visiblePeople = people.filter(({ name }) => name.toLowerCase().includes(query));

  return (
    <table>
      <caption>Star Wars characters</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Birth year</th>
          <th scope="col">Favorite</th>
        </tr>
      </thead>
      <tbody>
        {visiblePeople.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            isFavorite={favorites.includes(person.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </tbody>
    </table>
  );
}
