import { track } from '../analytics';
import type { Person } from '../model/person';

interface FavoriteButtonProps {
  person: Person;
  onAdd: (person: Person) => void;
}

export function FavoriteButton({ person, onAdd }: FavoriteButtonProps) {
  // The click IS the event: the side effect runs in its handler, once per
  // click. No state to trigger it, no effect to forget a repeated value, no
  // extra render — and no double tracking when StrictMode remounts the button.
  function handleClick() {
    track('add_to_lineup', person.id);
    onAdd(person);
  }

  return (
    <button type="button" onClick={handleClick}>
      Add {person.name} to the lineup
    </button>
  );
}
