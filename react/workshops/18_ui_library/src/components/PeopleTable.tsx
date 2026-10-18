import type { Person } from '../model/person';

// TODO 3.1: rebuild it with MUI: `TableContainer component={Paper}` > `Table`
//           (keep the aria-label, `size="small"`) > `TableHead` / `TableBody` >
//           `TableRow` > `TableCell`. The name cell stays a row header
//           (`component="th" scope="row"`); numbers are `align="right"`.
// TODO 3.2: sortable Name, Height and Mass columns: a `{ key, direction }` state
//           (name ascending at first), a `TableSortLabel` in each of their
//           headers, and `sortDirection` on the `TableCell` (it sets `aria-sort`).
//           A new column starts ascending; the same one flips. Sort a COPY
//           (`toSorted`), during render.

export function PeopleTable({ people }: { people: readonly Person[] }) {
  return (
    <table aria-label="Star Wars people" className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Height (cm)</th>
          <th>Mass (kg)</th>
          <th>Birth year</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id}>
            <th scope="row">{person.name}</th>
            <td>{person.height}</td>
            <td>{person.mass}</td>
            <td>{person.birthYear}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
