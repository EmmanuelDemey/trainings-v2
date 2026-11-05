import type { Person } from '../model/person';
import { selectIsFavorite, toggled } from './favoritesSlice';
import { useAppDispatch, useAppSelector } from './store';

export function ReduxFavoriteButton({ person }: { person: Person }) {
  // Subscribes to ONE boolean: starring someone else leaves this button alone.
  const pressed = useAppSelector((state) => selectIsFavorite(state, person.id));
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      className="star"
      aria-label={`Favorite ${person.name}`}
      aria-pressed={pressed}
      onClick={() => dispatch(toggled(person.id))}
    >
      {pressed ? '★' : '☆'}
    </button>
  );
}
