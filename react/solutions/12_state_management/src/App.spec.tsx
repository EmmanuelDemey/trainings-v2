import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

// These specs only know what the user sees. They are green on the starter's
// prop drilling, and must stay green through the refactoring to contexts.
describe('App', () => {
  it('filters the table by name', async () => {
    render(<App />);

    await userEvent.type(screen.getByLabelText('Filter by name'), 'o');

    expect(screen.getByRole('rowheader', { name: 'Leia Organa' })).toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'R2-D2' })).not.toBeInTheDocument();
  });

  it('counts the favorites in the header', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Favorite Luke Skywalker' }));
    await userEvent.click(screen.getByRole('button', { name: 'Favorite C-3PO' }));

    expect(screen.getByText('Favorites: 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Favorite C-3PO' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the favorites of the characters the filter hides', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Favorite R2-D2' }));

    await userEvent.type(screen.getByLabelText('Filter by name'), 'luke');

    expect(screen.getByText('Favorites: 1')).toBeInTheDocument();
  });

  it('clears the favorites from the header', async () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Clear favorites' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Favorite Darth Vader' }));

    await userEvent.click(screen.getByRole('button', { name: 'Clear favorites' }));

    expect(screen.getByText('Favorites: 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Favorite Darth Vader' })).toHaveAttribute('aria-pressed', 'false');
  });
});
