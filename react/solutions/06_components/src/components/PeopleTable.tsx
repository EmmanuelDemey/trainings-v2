import type { ReactNode } from 'react';
import type { Person } from '../model/person';
import { formatHeight, formatMass } from '../utils/format';

type PeopleTableProps = {
  people: Person[];
  /**
   * A render prop: lets the caller decide how a name is displayed, without the
   * table knowing why. Defaults to the plain name.
   */
  renderName?: (person: Person) => ReactNode;
};

export function PeopleTable({ people, renderName = (person) => person.name }: PeopleTableProps) {
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
          <th scope="col">Mass</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id}>
            <td>{renderName(person)}</td>
            <td>{person.birthYear}</td>
            <td className="number">{formatHeight(person.height)}</td>
            <td className="number">{formatMass(person.mass)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
