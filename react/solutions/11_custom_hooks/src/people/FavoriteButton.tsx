import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Person } from '../model/person';
import { FAVORITES_KEY, NO_FAVORITES } from './favorites';

interface FavoriteButtonProps {
  person: Person;
}

export function FavoriteButton({ person }: FavoriteButtonProps) {
  const [favorites, setFavorites] = useLocalStorage(FAVORITES_KEY, NO_FAVORITES);
  const isFavorite = favorites.includes(person.id);

  const toggle = () =>
    setFavorites((ids) => (ids.includes(person.id) ? ids.filter((id) => id !== person.id) : [...ids, person.id]));

  return (
    <button type="button" aria-label={`Favorite ${person.name}`} aria-pressed={isFavorite} onClick={toggle}>
      {isFavorite ? '★' : '☆'}
    </button>
  );
}
