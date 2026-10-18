import { useEffect, useState } from 'react';

// A typed prop instead of `any`: `no-explicit-any` pointed at it.
type LikeButtonProps = {
  label: string;
};

export function LikeButton({ label }: LikeButtonProps) {
  // `const`: the binding is never reassigned — only the state behind it changes.
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    document.title = `${label} — ${likes} likes`;
    // `exhaustive-deps` was right: with `[]`, the effect ran once and the title
    // never followed the likes. Every value the effect reads is a dependency.
  }, [label, likes]);

  return (
    <button type="button" onClick={() => setLikes(likes + 1)}>
      ❤ {likes} likes
    </button>
  );
}
