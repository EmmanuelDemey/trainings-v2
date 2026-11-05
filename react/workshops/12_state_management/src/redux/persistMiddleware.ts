import type { Middleware } from '@reduxjs/toolkit';

export const FAVORITES_KEY = 'tp12.favorites';

/** The part of `Storage` the middleware needs — `localStorage` fits. */
export type FavoritesStorage = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * A middleware: `store => next => action`. It sees every action on its way to
 * the reducers, and can act before AND after them.
 */
export function createPersistMiddleware(storage: FavoritesStorage): Middleware<object, { favorites: { ids: string[] } }> {
  // TODO 8.1: call `next(action)` FIRST and keep its result: once it returns,
  //   the reducers have run. Then, when the action is `toggled` or `cleared`
  //   (`isAnyOf(toggled, cleared)(action)`), write the ids as JSON under
  //   FAVORITES_KEY. Return the result of `next`.
  void storage;
  return () => (next) => (action) => next(action);
}

/** The ids saved by a previous visit — or none, whatever the storage holds. */
export function loadFavorites(storage: FavoritesStorage): string[] {
  // TODO 8.2: parse the stored JSON; return it only if it is an array of
  //   strings, `[]` otherwise — a broken value must not break the app.
  void storage;
  return [];
}
