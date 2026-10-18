import { useFilter } from '../context/FilterContext';
import { people } from '../data/people';
import { PersonRow } from './PersonRow';

export function PeopleTable() {
  const { filter } = useFilter();
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
          <PersonRow key={person.id} person={person} />
        ))}
      </tbody>
    </table>
  );
}
