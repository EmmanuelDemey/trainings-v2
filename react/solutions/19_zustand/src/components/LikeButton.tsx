import type { Person } from '../model/person';
import { selectIsLiked, useLikes } from '../store/likes';

interface LikeButtonProps {
  person: Person;
}

export function LikeButton({ person }: LikeButtonProps) {
  // One boolean, not the whole store: liking Luke changes what Luke's selector
  // returns and nobody else's, so only Luke's button re-renders. With
  // `const { likedIds } = useLikes()` every row would re-render on every like.
  const liked = useLikes(selectIsLiked(person.id));
  // Actions never change, so selecting them never triggers a re-render.
  const like = useLikes((state) => state.like);
  const unlike = useLikes((state) => state.unlike);

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
