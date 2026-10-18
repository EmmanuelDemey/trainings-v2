import { useLikes } from '../store/likes';

export function ResetLikesButton() {
  // TODO 3.3: select the action and a boolean "nothing to reset" instead of
  // the whole store.
  const { likedIds, reset } = useLikes();

  return (
    <button type="button" onClick={reset} disabled={likedIds.length === 0}>
      Reset likes
    </button>
  );
}
