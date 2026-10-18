import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { people } from '../data/people';
import { PeopleTable } from './PeopleTable';

/** The names, in the order of the rows. */
function names(): string[] {
  const [, body] = within(screen.getByRole('table', { name: 'Star Wars people' })).getAllByRole('rowgroup');
  return within(body!)
    .getAllByRole('row')
    .map((row) => within(row).getByRole('rowheader').textContent ?? '');
}

describe('step 3 — the MUI table', () => {
  it('shows one row per person, with the name as the header of its row', () => {
    render(<PeopleTable people={people} />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(names()).toHaveLength(people.length);
  });

  it('is sorted by name at first, and says so', () => {
    render(<PeopleTable people={people} />);

    expect(names()).toEqual(['C-3PO', 'Darth Vader', 'Leia Organa', 'Luke Skywalker', 'Obi-Wan Kenobi', 'R2-D2']);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('sorts by height when its header is clicked, then flips the order', async () => {
    const user = userEvent.setup();
    render(<PeopleTable people={people} />);

    await user.click(screen.getByRole('button', { name: 'Height (cm)' }));
    expect(names()[0]).toBe('R2-D2');
    expect(names().at(-1)).toBe('Darth Vader');
    expect(screen.getByRole('columnheader', { name: 'Height (cm)' })).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByRole('columnheader', { name: 'Name' })).not.toHaveAttribute('aria-sort');

    await user.click(screen.getByRole('button', { name: 'Height (cm)' }));
    expect(names()[0]).toBe('Darth Vader');
    expect(screen.getByRole('columnheader', { name: 'Height (cm)' })).toHaveAttribute('aria-sort', 'descending');
  });

  it('leaves the array it was given untouched', async () => {
    const user = userEvent.setup();
    const given = [...people];
    render(<PeopleTable people={given} />);

    await user.click(screen.getByRole('button', { name: 'Mass (kg)' }));

    expect(given).toEqual(people);
  });
});
