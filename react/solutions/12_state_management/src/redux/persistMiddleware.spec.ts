import { describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '../tests/memoryStorage';
import type { PeopleApi } from './api';
import { selectFavoriteIds, toggled } from './favoritesSlice';
import { FAVORITES_KEY } from './persistMiddleware';
import { searchRequested } from './searchSlice';
import { makeStore } from './store';

const api: PeopleApi = { searchPeople: vi.fn(async () => []) };

describe('the persistence middleware', () => {
  it('writes the favorites to the storage after each favorites action', () => {
    const storage = memoryStorage();
    const store = makeStore({ api, storage });

    store.dispatch(toggled('1'));
    store.dispatch(toggled('5'));

    // Written AFTER the reducer ran: the storage holds the NEW state.
    expect(storage.setItem).toHaveBeenLastCalledWith(FAVORITES_KEY, JSON.stringify(['1', '5']));
  });

  it('does not touch the storage for the actions of another slice', () => {
    const storage = memoryStorage();
    const store = makeStore({ api, storage });

    store.dispatch(searchRequested('luke'));

    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('lets the action through — the reducers still see it', () => {
    const store = makeStore({ api, storage: memoryStorage() });

    store.dispatch(toggled('1'));

    expect(selectFavoriteIds(store.getState())).toEqual(['1']);
  });

  it('gives the favorites back to a new store — a "reload"', () => {
    const storage = memoryStorage();
    makeStore({ api, storage }).dispatch(toggled('10'));

    const reloaded = makeStore({ api, storage });

    expect(selectFavoriteIds(reloaded.getState())).toEqual(['10']);
  });

  it('starts empty when the stored value is not a list of ids', () => {
    const storage = memoryStorage({ [FAVORITES_KEY]: '{not json' });

    const store = makeStore({ api, storage });

    expect(selectFavoriteIds(store.getState())).toEqual([]);
  });
});
