import type { Person } from '../model/person';

interface FavoriteButtonProps {
  person: Person;
  pressed: boolean;
  onToggle: (id: string) => void;
}

// TODO 5.2: read `isFavorite` and `toggle` from `useFavorites()`; keep only `person`.
export function FavoriteButton({ person, pressed, onToggle }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className="star"
      aria-label={`Favorite ${person.name}`}
      aria-pressed={pressed}
      onClick={() => onToggle(person.id)}
    >
      {pressed ? '★' : '☆'}
    </button>
  );
}
