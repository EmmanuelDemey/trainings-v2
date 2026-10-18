import type { Person } from '../model/person';
import { useLikes } from '../store/likes';

interface LikeButtonProps {
  person: Person;
}

export function LikeButton({ person }: LikeButtonProps) {
  // TODO 3.1: this subscribes to the WHOLE store — every like re-renders every
  // button of the table. Select only what this button needs: `selectIsLiked`
  // for the boolean, one selector per action.
  const { likedIds, like, unlike } = useLikes();
  const liked = likedIds.includes(person.id);

  return (
    <button
      type="button"
      className="like-button"
      aria-label={`Like ${person.name}`}
      aria-pressed={liked}
      onClick={() => (liked ? unlike(person.id) : like(person.id))}
    >
      {liked ? '♥' : '♡'}
    </button>
  );
}
