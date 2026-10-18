import type { Person } from '../model/person';
import { formatHeight, formatMass } from '../utils/format';

type PeopleTableProps = {
  people: readonly Person[];
};

export function PeopleTable({ people }: PeopleTableProps) {
  if (people.length === 0) {
    return <p role="status">No people match your search.</p>;
  }

  return (
    <table>
      <caption>Star Wars people</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Height</th>
          <th scope="col">Mass</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id}>
            <th scope="row">{person.name}</th>
            <td>{formatHeight(person.height)}</td>
            <td>{formatMass(person.mass)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
