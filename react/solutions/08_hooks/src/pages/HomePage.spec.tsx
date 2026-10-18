import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from './HomePage';
import { people } from '../data/people';

function names() {
  const [, body] = screen.getAllByRole('rowgroup');
  return within(body)
    .getAllByRole('button')
    .map((button) => button.textContent);
}

describe('HomePage', () => {
  it('focuses the filter as soon as it is shown', () => {
    render(<HomePage onSelect={() => {}} />);

    expect(screen.getByRole('searchbox', { name: 'Filter by name' })).toHaveFocus();
  });

  it('lists everybody while the filter is empty', () => {
    render(<HomePage onSelect={() => {}} />);

    expect(names()).toHaveLength(people.length);
  });

  it('keeps what the user types in the filter', async () => {
    const user = userEvent.setup();
    render(<HomePage onSelect={() => {}} />);

    await user.type(screen.getByRole('searchbox', { name: 'Filter by name' }), 'lars');

    expect(screen.getByRole('searchbox', { name: 'Filter by name' })).toHaveValue('lars');
  });

  it('narrows the table to the names matching the filter', async () => {
    const user = userEvent.setup();
    render(<HomePage onSelect={() => {}} />);

    await user.type(screen.getByRole('searchbox', { name: 'Filter by name' }), 'lars');

    expect(names()).toEqual(['Owen Lars', 'Beru Whitesun Lars']);
  });

  it('says so when nobody matches', async () => {
    const user = userEvent.setup();
    render(<HomePage onSelect={() => {}} />);

    await user.type(screen.getByRole('searchbox', { name: 'Filter by name' }), 'jar jar');

    expect(screen.getByRole('status')).toHaveTextContent('No character matches.');
  });

  it('reports the id of the person the user clicks', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<HomePage onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'Darth Vader' }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('4');
  });
});
