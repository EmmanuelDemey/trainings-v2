import { selectLikeCount, useLikes } from '../store/likes';

export function ResetLikesButton() {
  const reset = useLikes((state) => state.reset);
  const nothingToReset = useLikes((state) => selectLikeCount(state) === 0);

  return (
    <button type="button" onClick={reset} disabled={nothingToReset}>
      Reset likes
    </button>
  );
}
