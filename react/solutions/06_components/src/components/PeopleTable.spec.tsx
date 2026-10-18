import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { PeopleTable } from './PeopleTable';
import { people } from '../data/people';

describe('PeopleTable', () => {
  it('renders the people it is given, one row each', () => {
    render(<PeopleTable people={people.slice(0, 3)} />);

    const [, body] = screen.getAllByRole('rowgroup');
    const names = within(body)
      .getAllByRole('row')
      .map((row) => within(row).getAllByRole('cell')[0].textContent);
    expect(names).toEqual(['Luke Skywalker', 'C-3PO', 'R2-D2']);
  });

  it('says so when it is given nobody', () => {
    render(<PeopleTable people={[]} />);

    expect(screen.getByRole('status')).toHaveTextContent('No character matches.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
