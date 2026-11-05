import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { people } from '../data/people';
import { memoryStorage } from '../tests/memoryStorage';
import { ReduxFavoriteButton } from './ReduxFavoriteButton';
import { makeStore } from './store';

const luke = people.find(({ name }) => name === 'Luke Skywalker')!;
const leia = people.find(({ name }) => name === 'Leia Organa')!;

function renderButtons(onLeiaRender = vi.fn()) {
  const store = makeStore({ api: { searchPeople: async () => [] }, storage: memoryStorage() });
  render(
    <Provider store={store}>
      <ReduxFavoriteButton person={luke} />
      <Profiler id="leia" onRender={onLeiaRender}>
        <ReduxFavoriteButton person={leia} />
      </Profiler>
    </Provider>,
  );
  return store;
}

describe('ReduxFavoriteButton', () => {
  it('stars and unstars a character through the store', async () => {
    const store = renderButtons();
    const button = screen.getByRole('button', { name: 'Favorite Luke Skywalker' });

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(store.getState().favorites.ids).toEqual([luke.id]);

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it("does not re-render Leia's button when Luke is starred — a selector, not the whole slice", async () => {
    const onLeiaRender = vi.fn();
    renderButtons(onLeiaRender);

    await userEvent.click(screen.getByRole('button', { name: 'Favorite Luke Skywalker' }));

    expect(screen.getByRole('button', { name: 'Favorite Luke Skywalker' })).toHaveAttribute('aria-pressed', 'true');
    // The mount, and nothing else.
    expect(onLeiaRender).toHaveBeenCalledOnce();
  });
});
