import { isAnyOf, type Middleware } from '@reduxjs/toolkit';
import { cleared, toggled } from './favoritesSlice';

export const FAVORITES_KEY = 'tp12.favorites';

/** The part of `Storage` the middleware needs — `localStorage` fits. */
export type FavoritesStorage = Pick<Storage, 'getItem' | 'setItem'>;

const isFavoritesAction = isAnyOf(toggled, cleared);

/**
 * A middleware: `store => next => action`. It sees every action on its way to
 * the reducers, and can act before AND after them.
 */
export function createPersistMiddleware(storage: FavoritesStorage): Middleware<object, { favorites: { ids: string[] } }> {
  return (store) => (next) => (action) => {
    // Forward first: once `next` returns, the reducers have run.
    const result = next(action);
    if (isFavoritesAction(action)) {
      storage.setItem(FAVORITES_KEY, JSON.stringify(store.getState().favorites.ids));
    }
    return result;
  };
}

/** The ids saved by a previous visit — or none, whatever the storage holds. */
export function loadFavorites(storage: FavoritesStorage): string[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(FAVORITES_KEY) ?? '[]');
    return Array.isArray(value) && value.every((id) => typeof id === 'string') ? value : [];
  } catch {
    return [];
  }
}
