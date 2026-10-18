import { likePerson } from '../likes';
import type { Person } from '../model/person';

interface LikeButtonProps {
  person: Person;
  onLiked: (id: string) => void;
}

export function LikeButton({ person, onLiked }: LikeButtonProps) {
  const like = () => {
    // TODO 4.1: like Darth Vader and look at the console. An error boundary
    // around the table would not help: why? Catch the error here instead…
    likePerson(person);
    onLiked(person.id);
  };

  return (
    <>
      <button type="button" aria-label={`Like ${person.name}`} onClick={like}>
        Like
      </button>
      {/* TODO 4.2: …keep its message in a state, and show it here in a `role="alert"`. */}
    </>
  );
}
