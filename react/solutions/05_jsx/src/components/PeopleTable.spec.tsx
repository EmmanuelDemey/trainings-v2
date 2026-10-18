import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { PeopleTable } from './PeopleTable';
import { people } from '../data/people';

const luke = people.find(({ name }) => name === 'Luke Skywalker')!;
const r2d2 = people.find(({ name }) => name === 'R2-D2')!;
const tarkin = people.find(({ name }) => name === 'Wilhuff Tarkin')!;

function rowOf(name: string) {
  return screen.getByRole('row', { name: new RegExp(`^${name}`) });
}

describe('PeopleTable', () => {
  it('renders a table named by its caption, with the people-table class', () => {
    render(<PeopleTable people={people} />);

    expect(screen.getByRole('table', { name: 'Characters' })).toHaveClass('people-table');
  });

  it('has the five column headers', () => {
    render(<PeopleTable people={people} />);

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual(['Name', 'Gender', 'Birth year', 'Height', 'Mass']);
  });

  it('renders one body row per person', () => {
    render(<PeopleTable people={people} />);

    const [, body] = screen.getAllByRole('rowgroup');
    expect(within(body).getAllByRole('row')).toHaveLength(people.length);
  });

  it('shows the formatted height and mass of each person', () => {
    render(<PeopleTable people={[luke, tarkin]} />);

    const lukeCells = within(rowOf('Luke Skywalker')).getAllByRole('cell');
    expect(lukeCells.map((cell) => cell.textContent)).toEqual([
      'Luke Skywalker',
      'male',
      '19BBY',
      '1.72 m',
      '77 kg',
    ]);
    expect(within(rowOf('Wilhuff Tarkin')).getByRole('cell', { name: 'unknown' })).toBeInTheDocument();
  });

  it('flags the droids with a badge, and only them', () => {
    render(<PeopleTable people={[luke, r2d2]} />);

    expect(within(rowOf('R2-D2')).getByText('Droid')).toBeInTheDocument();
    expect(within(rowOf('Luke Skywalker')).queryByText('Droid')).not.toBeInTheDocument();
  });

  it('shows an empty state instead of the table when there is nobody', () => {
    render(<PeopleTable people={[]} />);

    expect(screen.getByRole('status')).toHaveTextContent('No character to display.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
