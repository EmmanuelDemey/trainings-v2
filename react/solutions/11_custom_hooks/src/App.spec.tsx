import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('lists the characters matching the search, once the typing has settled', async () => {
    render(<App />);
    expect(await screen.findByText('Obi-Wan Kenobi')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Search a character'), 'sky');

    await waitFor(() => {
      const results = screen.getByRole('list', { name: 'Results' });
      expect(within(results).getAllByRole('listitem')).toHaveLength(1);
    });
    expect(screen.getByRole('listitem')).toHaveTextContent('Luke Skywalker');
  });

  it('counts the favorites in the header, and remembers them after a reload', async () => {
    const { unmount } = render(<App />);

    await userEvent.click(await screen.findByRole('button', { name: 'Favorite Leia Organa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Favorite R2-D2' }));

    expect(screen.getByText('Favorites: 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Favorite Leia Organa' })).toHaveAttribute('aria-pressed', 'true');

    unmount();
    render(<App />);
    expect(screen.getByText('Favorites: 2')).toBeInTheDocument();
  });

  it('removes a favorite on a second click', async () => {
    render(<App />);
    const star = await screen.findByRole('button', { name: 'Favorite Luke Skywalker' });

    await userEvent.click(star);
    await userEvent.click(star);

    expect(screen.getByText('Favorites: 0')).toBeInTheDocument();
    expect(star).toHaveAttribute('aria-pressed', 'false');
  });
});
