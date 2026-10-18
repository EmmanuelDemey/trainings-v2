import { useEffect, useState } from 'react';

// TODO 5: once oxlint is set up (step 4), `npm run lint` reports four
//         problems in this file, from three rules. Fix them all — one of
//         them is a real bug, and `LikeButton.spec.tsx` proves it.
export function LikeButton(props: any) {
  let [likes, setLikes] = useState(0);

  useEffect(() => {
    document.title = `${props.label} — ${likes} likes`;
  }, []);

  return (
    <button type="button" onClick={() => setLikes(likes + 1)}>
      ❤ {likes} likes
    </button>
  );
}
