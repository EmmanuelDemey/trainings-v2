import { useState } from 'react';
import { JediTraining } from './components/JediTraining';
import { Lineup } from './components/Lineup';
import { PeopleSearch } from './components/PeopleSearch';
import { ReviewPanel } from './components/ReviewPanel';
import { people } from './data/people';
import type { Person } from './model/person';
import type { Review } from './model/review';

export function App() {
  const [lineup, setLineup] = useState<Person[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  function addToLineup(person: Person) {
    setLineup((current) => (current.some(({ id }) => id === person.id) ? current : [...current, person]));
  }

  function move(from: number, to: number) {
    setLineup((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  return (
    <main>
      <h1>Star Wars people</h1>
      <PeopleSearch people={people} onAdd={addToLineup} />
      <Lineup people={lineup} onMove={move} />
      <ReviewPanel people={people} onSubmit={(review) => setReviews((current) => [...current, review])} />
      <p>Reviews sent: {reviews.length}</p>
      <JediTraining />
    </main>
  );
}
