import { useEffect, useRef, useState } from 'react';

type LikeButtonProps = {
  name: string;
};

const THANKS_DURATION_MS = 2000;

export function LikeButton({ name }: LikeButtonProps) {
  const [likes, setLikes] = useState(0);
  const [thanksVisible, setThanksVisible] = useState(false);

  // The timer id is needed by the next click and by the cleanup, but it is not
  // displayed: a ref, not a state — changing it must not re-render.
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Unmounting while the message is shown must not leave a timer behind.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  function thank() {
    setThanksVisible(true);
    // A new like restarts the 2 seconds instead of stacking a second timer.
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setThanksVisible(false), THANKS_DURATION_MS);
  }

  function like() {
    // Two state updates, ONE re-render: React batches them.
    setLikes((count) => count + 1);
    thank();
  }

  function superLike() {
    // The updater form receives the PENDING value. With `setLikes(likes + 1)`
    // twice, both calls would read the same `likes` from this render: +1.
    setLikes((count) => count + 1);
    setLikes((count) => count + 1);
    thank();
  }

  return (
    <div className="likes">
      <button type="button" onClick={like}>
        Like {name}
      </button>
      <button type="button" onClick={superLike}>
        Super like
      </button>
      <span>
        {likes} {likes === 1 ? 'like' : 'likes'}
      </span>
      {thanksVisible && (
        <span role="status" className="thanks">
          Thanks for liking {name}!
        </span>
      )}
    </div>
  );
}
