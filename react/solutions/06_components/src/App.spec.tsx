import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { people } from './data/people';

function bodyRows() {
  const table = within(screen.getByRole('region', { name: 'Characters' })).getByRole('table');
  return within(table).getAllByRole('row').slice(1);
}

describe('App', () => {
  it('shows the page title', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Star Wars people' })).toBeInTheDocument();
  });

  it('puts the filter in a "Search" card and the table in a "Characters" card', () => {
    render(<App />);

    expect(
      within(screen.getByRole('region', { name: 'Search' })).getByRole('searchbox', { name: 'Filter by name' }),
    ).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(people.length);
  });

  it('counts the characters in the footer of the table card', () => {
    render(<App />);

    expect(within(screen.getByRole('region', { name: 'Characters' })).getByRole('contentinfo')).toHaveTextContent(
      `${people.length} of ${people.length} characters`,
    );
  });

  it('narrows the table and the count as the user types in the filter', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Filter by name' }), 'sky');

    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toHaveTextContent('Luke Skywalker');
    expect(screen.getByRole('contentinfo')).toHaveTextContent(`1 of ${people.length} characters`);
  });
});
