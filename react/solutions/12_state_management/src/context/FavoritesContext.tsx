import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { favoritesReducer, type FavoritesState } from './favoritesReducer';

interface FavoritesContextValue {
  favorites: FavoritesState;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/**
 * A context of its OWN, not a field of the filter's: typing in the filter
 * must not re-render the components that only care about the favorites.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, []);

  // `dispatch` never changes, so the value only changes with `favorites`.
  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggle: (id) => dispatch({ type: 'toggled', id }),
      clear: () => dispatch({ type: 'cleared' }),
    }),
    [favorites],
  );

  return <FavoritesContext value={value}>{children}</FavoritesContext>;
}

export function useFavorites(): FavoritesContextValue {
  const value = useContext(FavoritesContext);
  if (!value) {
    throw new Error('useFavorites must be used inside a <FavoritesProvider>');
  }
  return value;
}
