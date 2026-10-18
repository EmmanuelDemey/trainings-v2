import { useEffect, useState } from 'react';
import { rankFor, type Rank } from '../ranks';

export function JediTraining() {
  const [points, setPoints] = useState(0);

  // TODO 4.1: an effect CHAIN. A click sets `points`, which runs an effect that
  //   sets `rank`, which runs another effect that sets `announcement`: three
  //   commits for one click, and the screen shows a rank that does not match
  //   the points in between. `rank` can be computed while rendering; the
  //   announcement belongs to the click that caused the promotion.
  const [rank, setRank] = useState<Rank>('Youngling');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    setRank(rankFor(points));
  }, [points]);

  useEffect(() => {
    if (rank !== 'Youngling') setAnnouncement(`Promoted to ${rank}!`);
  }, [rank]);

  function train() {
    setPoints((current) => current + 1);
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
