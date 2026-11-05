import type { Person } from '../model/person';
import { useAppSelector } from './store';

export function ReduxFavoriteButton({ person }: { person: Person }) {
  // TODO 7.2: this subscribes to the WHOLE slice: starring Luke re-renders
  //   Leia's button. Select ONE boolean with `selectIsFavorite(state, person.id)`.
  const favorites = useAppSelector((state) => state.favorites);
  const pressed = favorites.ids.includes(person.id);

  // TODO 7.3: `useAppDispatch()`, and dispatch `toggled(person.id)` on click.
  return (
    <button type="button" className="star" aria-label={`Favorite ${person.name}`} aria-pressed={pressed}>
      {pressed ? '★' : '☆'}
    </button>
  );
}
