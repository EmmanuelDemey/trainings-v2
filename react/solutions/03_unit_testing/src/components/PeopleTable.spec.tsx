import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { people } from '../data/people';
import { PeopleTable } from './PeopleTable';

describe('PeopleTable', () => {
  it('shows one row per person, under a header row', () => {
    render(<PeopleTable people={people} />);

    const table = screen.getByRole('table', { name: 'Star Wars people' });
    // 1 header row + 5 people.
    expect(within(table).getAllByRole('row')).toHaveLength(6);
  });

  it('shows the formatted height and mass of each person', () => {
    render(<PeopleTable people={people} />);

    const row = screen.getByRole('row', { name: /luke skywalker/i });
    expect(within(row).getByRole('cell', { name: '1.72 m' })).toBeInTheDocument();
    expect(within(row).getByRole('cell', { name: '77 kg' })).toBeInTheDocument();
  });

  it('shows a message instead of an empty table', () => {
    render(<PeopleTable people={[]} />);

    expect(screen.getByRole('status')).toHaveTextContent('No people match your search.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the markup of a row', () => {
    render(<PeopleTable people={[people[0]]} />);

    expect(screen.getByRole('row', { name: /luke skywalker/i })).toMatchInlineSnapshot(`
      <tr>
        <th
          scope="row"
        >
          Luke Skywalker
        </th>
        <td>
          1.72 m
        </td>
        <td>
          77 kg
        </td>
      </tr>
    `);
  });
});
