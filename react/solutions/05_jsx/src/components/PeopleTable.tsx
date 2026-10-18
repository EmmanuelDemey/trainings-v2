import type { Person } from '../model/person';
import { formatHeight, formatMass } from '../utils/format';

type PeopleTableProps = {
  people: Person[];
};

export function PeopleTable({ people }: PeopleTableProps) {
  // An early return is the clearest conditional rendering when the WHOLE output
  // changes: no table at all, rather than a table with an empty body.
  if (people.length === 0) {
    return (
      <p role="status" className="empty">
        No character to display.
      </p>
    );
  }

  return (
    // `className`, not `class`: JSX attributes are DOM properties, and `class`
    // is a reserved word in JavaScript.
    <table className="people-table">
      <caption>Characters</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Gender</th>
          <th scope="col">Birth year</th>
          <th scope="col">Height</th>
          <th scope="col">Mass</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          // The key is the person's id — stable and unique. The array index
          // would break as soon as the list is filtered or sorted (chapter 8).
          <tr key={person.id}>
            <td>
              {person.name}
              {/* `&&` renders the badge or nothing — the left side is a
                  boolean, never a number, so no stray "0" can leak in. */}
              {person.gender === 'n/a' && <span className="badge">Droid</span>}
            </td>
            <td>{person.gender}</td>
            <td>{person.birthYear}</td>
            <td className="number">{formatHeight(person.height)}</td>
            <td className="number">{formatMass(person.mass)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
