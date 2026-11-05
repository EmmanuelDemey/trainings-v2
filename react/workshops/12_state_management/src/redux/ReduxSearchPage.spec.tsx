import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { people } from '../data/people';
import { memoryStorage } from '../tests/memoryStorage';
import { ReduxSearchPage } from './ReduxSearchPage';
import { makeStore } from './store';

function renderPage() {
  const api = {
    searchPeople: async (query: string) =>
      people.filter(({ name }) => name.toLowerCase().includes(query.toLowerCase())),
  };
  render(
    <Provider store={makeStore({ api, storage: memoryStorage() })}>
      <ReduxSearchPage />
    </Provider>,
  );
}

describe('ReduxSearchPage', () => {
  it('searches as the user types, then stars a result', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText('Search by name'), 'sky');
    const results = await screen.findByRole('list', { name: 'Results' });
    expect(within(results).getAllByRole('listitem')).toHaveLength(1);

    await userEvent.click(within(results).getByRole('button', { name: 'Favorite Luke Skywalker' }));

    expect(screen.getByText('Favorites: 1')).toBeInTheDocument();
  });
});
