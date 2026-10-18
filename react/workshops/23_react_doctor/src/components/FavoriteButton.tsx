import { useEffect, useState } from 'react';
import { track } from '../analytics';
import type { Person } from '../model/person';

interface FavoriteButtonProps {
  person: Person;
  onAdd: (person: Person) => void;
}

export function FavoriteButton({ person, onAdd }: FavoriteButtonProps) {
  // TODO 5.1: this state exists only to TRIGGER the effect below. The click is
  //   the event, so the tracking belongs in the click handler. As it stands, a
  //   second click on the same person sets the same value, React bails out, and
  //   the effect never runs again: the click is lost. Delete the state and the
  //   effect, and call `track()` in `handleClick`.
  const [added, setAdded] = useState<Person | null>(null);
  useEffect(() => {
    if (added) track('add_to_lineup', added.id);
  }, [added]);

  function handleClick() {
    setAdded(person);
    onAdd(person);
  }

  return (
    <button type="button" onClick={handleClick}>
      Add {person.name} to the lineup
    </button>
  );
}
