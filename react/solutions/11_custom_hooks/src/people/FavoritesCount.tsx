import { useLocalStorage } from '../hooks/useLocalStorage';
import { FAVORITES_KEY, NO_FAVORITES } from './favorites';

/** Far from the buttons in the tree, and still in sync: same hook, same key. */
export function FavoritesCount() {
  const [favorites] = useLocalStorage(FAVORITES_KEY, NO_FAVORITES);
  return <p className="favorites-count">Favorites: {favorites.length}</p>;
}
