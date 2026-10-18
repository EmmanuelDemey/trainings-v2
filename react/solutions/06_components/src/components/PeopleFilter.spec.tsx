import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PeopleFilter } from './PeopleFilter';

describe('PeopleFilter', () => {
  it('shows the value it is given', () => {
    render(<PeopleFilter value="Lu" onChange={() => {}} />);

    expect(screen.getByRole('searchbox', { name: 'Filter by name' })).toHaveValue('Lu');
  });

  it('reports the new value — a string, not an event — on every keystroke', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PeopleFilter value="Lu" onChange={onChange} />);

    await user.type(screen.getByRole('searchbox', { name: 'Filter by name' }), 'k');

    expect(onChange).toHaveBeenCalledExactlyOnceWith('Luk');
  });

  it('does not change on its own: the parent owns the value', async () => {
    const user = userEvent.setup();
    render(<PeopleFilter value="Lu" onChange={() => {}} />);

    await user.type(screen.getByRole('searchbox', { name: 'Filter by name' }), 'k');

    expect(screen.getByRole('searchbox', { name: 'Filter by name' })).toHaveValue('Lu');
  });
});
