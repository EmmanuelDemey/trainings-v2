import { useFavorites } from '../context/FavoritesContext';
import type { Person } from '../model/person';

interface FavoriteButtonProps {
  person: Person;
}

export function FavoriteButton({ person }: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const pressed = isFavorite(person.id);

  return (
    <button
      type="button"
      className="star"
      aria-label={`Favorite ${person.name}`}
      aria-pressed={pressed}
      onClick={() => toggle(person.id)}
    >
      {pressed ? '★' : '☆'}
    </button>
  );
}
