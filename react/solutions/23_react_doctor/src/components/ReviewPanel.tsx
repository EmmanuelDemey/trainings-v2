import { useState } from 'react';
import type { Person } from '../model/person';
import type { Review } from '../model/review';
import { PersonReview } from './PersonReview';

interface ReviewPanelProps {
  people: Person[];
  onSubmit: (review: Review) => void;
}

export function ReviewPanel({ people, onSubmit }: ReviewPanelProps) {
  // `null` means "nobody picked yet": the first person is DERIVED from the
  // prop at render time rather than copied into the state once.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = people.find((person) => person.id === selectedId) ?? people[0];

  return (
    <section aria-labelledby="review-title">
      <h2 id="review-title">Reviews</h2>
      <label htmlFor="review-person">Person to review</label>
      <select id="review-person" value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>
        {people.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name}
          </option>
        ))}
      </select>
      {/* One review form per person: a new `key` unmounts the previous form and
          mounts a fresh one, so the draft is blank in the very commit that
          selects someone else. */}
      <PersonReview key={selected.id} person={selected} onSubmit={onSubmit} />
    </section>
  );
}
