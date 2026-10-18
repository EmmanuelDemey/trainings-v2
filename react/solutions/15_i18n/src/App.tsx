import { useState } from 'react';
import { Header } from './components/Header';
import { LikesSummary } from './components/LikesSummary';
import { PeopleTable } from './components/PeopleTable';
import { people } from './data/people';

export function App() {
  const [likes, setLikes] = useState<ReadonlySet<string>>(new Set());

  function toggleLike(id: string) {
    setLikes((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main>
      <Header />
      <LikesSummary count={likes.size} />
      <PeopleTable people={people} likes={likes} onToggleLike={toggleLike} />
    </main>
  );
}
