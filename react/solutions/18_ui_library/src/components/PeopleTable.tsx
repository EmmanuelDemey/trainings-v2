import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import type { Person } from '../model/person';

type SortKey = 'name' | 'height' | 'mass';
type Sort = { key: SortKey; direction: 'asc' | 'desc' };

const columns: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: 'name', label: 'Name', numeric: false },
  { key: 'height', label: 'Height (cm)', numeric: true },
  { key: 'mass', label: 'Mass (kg)', numeric: true },
];

function compare(a: Person, b: Person, { key, direction }: Sort): number {
  const order = key === 'name' ? a.name.localeCompare(b.name) : a[key] - b[key];
  return direction === 'asc' ? order : -order;
}

export function PeopleTable({ people }: { people: readonly Person[] }) {
  const [sort, setSort] = useState<Sort>({ key: 'name', direction: 'asc' });
  // Derived during render, never stored: `toSorted` leaves the prop untouched.
  const rows = people.toSorted((a, b) => compare(a, b, sort));

  const sortBy = (key: SortKey) =>
    setSort((current) => ({
      key,
      // A new column starts ascending; the same column flips.
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));

  return (
    // `component={Paper}`: the container RENDERS a Paper — its background and
    // elevation, which follow the theme's mode.
    <TableContainer component={Paper}>
      <Table aria-label="Star Wars people" size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.numeric ? 'right' : 'left'}
                // `sortDirection` is what sets `aria-sort` on the <th>.
                sortDirection={sort.key === column.key ? sort.direction : false}
              >
                <TableSortLabel
                  active={sort.key === column.key}
                  direction={sort.key === column.key ? sort.direction : 'asc'}
                  onClick={() => sortBy(column.key)}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell>Birth year</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((person) => (
            <TableRow key={person.id} hover>
              <TableCell component="th" scope="row">
                {person.name}
              </TableCell>
              <TableCell align="right">{person.height}</TableCell>
              <TableCell align="right">{person.mass}</TableCell>
              <TableCell>{person.birthYear}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
