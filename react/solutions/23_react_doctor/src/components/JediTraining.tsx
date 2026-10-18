import { useState } from 'react';
import { rankFor } from '../ranks';

export function JediTraining() {
  const [points, setPoints] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  // Computed while rendering: the rank can never disagree with the points.
  const rank = rankFor(points);

  // Everything one click changes is written by that click, in one batch, so
  // React commits once. The promotion is detected here, where we know both the
  // old and the new number of points.
  function train() {
    const next = points + 1;
    setPoints(next);
    if (rankFor(next) !== rank) setAnnouncement(`Promoted to ${rankFor(next)}!`);
  }

  return (
    <section aria-labelledby="training-title">
      <h2 id="training-title">Jedi training</h2>
      <p>Training points: {points}</p>
      <p>Rank: {rank}</p>
      <p role="status">{announcement}</p>
      <button type="button" onClick={train}>
        Train
      </button>
    </section>
  );
}
