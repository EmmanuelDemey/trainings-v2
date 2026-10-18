import type { ReactNode } from 'react';
import type { FavoritesState } from './favoritesReducer';

interface FavoritesContextValue {
  favorites: FavoritesState;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
}

// TODO 4.1: create the context, with `null` as its default value.

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // TODO 4.2: `useReducer(favoritesReducer, [])`, and provide
  //           `{ favorites, isFavorite, toggle, clear }` — memoised on `favorites`.
  return <>{children}</>;
}

export function useFavorites(): FavoritesContextValue {
  // TODO 4.3: read the context; throw
  //           'useFavorites must be used inside a <FavoritesProvider>' when it is null.
  throw new Error('TODO 4.3: useFavorites is not written yet');
}
