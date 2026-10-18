import { selectLikeCount, useLikes } from '../store/likes';

export function LikesCounter() {
  // A number: this component re-renders when the count changes, not when the
  // list changes for nothing (a like on someone already liked, for instance).
  const count = useLikes(selectLikeCount);

  return <p role="status">{count} liked</p>;
}
