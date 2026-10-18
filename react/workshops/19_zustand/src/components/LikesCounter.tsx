import { useLikes } from '../store/likes';

export function LikesCounter() {
  // TODO 3.2: subscribe to the count only, with `selectLikeCount`.
  const { likedIds } = useLikes();
  const count = likedIds.length;

  return <p role="status">{count} liked</p>;
}
