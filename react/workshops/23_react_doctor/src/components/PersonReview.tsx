import { useEffect, useState, type FormEvent } from 'react';
import type { Person } from '../model/person';
import type { Review } from '../model/review';

interface PersonReviewProps {
  person: Person;
  onSubmit: (review: Review) => void;
}

export function PersonReview({ person, onSubmit }: PersonReviewProps) {
  const [stars, setStars] = useState(3);
  const [comment, setComment] = useState('');

  // TODO 3.1: resetting EVERY state of a component when a prop changes is what
  //   `key` is for. This effect first commits the new person's form holding the
  //   previous person's draft, then commits again once it has cleared it.
  //   Delete it, and give the review a `key` in `ReviewPanel.tsx` instead.
  useEffect(() => {
    setStars(3);
    setComment('');
  }, [person.id]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ personId: person.id, stars, comment });
  }

  return (
    <form aria-label={`Review ${person.name}`} onSubmit={handleSubmit}>
      <label htmlFor="review-stars">Stars</label>
      <input
        id="review-stars"
        type="number"
        min={1}
        max={5}
        value={stars}
        onChange={(event) => {
          // A cleared number input is NaN, not 0: keep the last valid value.
          const value = event.target.valueAsNumber;
          if (!Number.isNaN(value)) setStars(value);
        }}
      />
      <label htmlFor="review-comment">Comment</label>
      <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} />
      <button type="submit">Send review</button>
    </form>
  );
}
