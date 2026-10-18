import { useState } from 'react';
import { likePerson } from '../likes';
import type { Person } from '../model/person';

interface LikeButtonProps {
  person: Person;
  onLiked: (id: string) => void;
}

export function LikeButton({ person, onLiked }: LikeButtonProps) {
  const [error, setError] = useState<string | null>(null);

  const like = () => {
    // An error boundary only catches what throws while React RENDERS. A click
    // handler runs later, outside rendering: its errors are ours to handle,
    // with a plain try / catch and some state to show them.
    try {
      likePerson(person);
      setError(null);
      onLiked(person.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  return (
    <>
      <button type="button" aria-label={`Like ${person.name}`} onClick={like}>
        Like
      </button>
      {error && (
        <span role="alert" className="inline-error">
          {error}
        </span>
      )}
    </>
  );
}
