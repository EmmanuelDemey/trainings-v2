import { useState, useTransition } from 'react';
import { PeopleList } from '../components/PeopleList';
import { PersonPanel } from '../components/PersonPanel';
import { people } from '../data/people';

export function PeoplePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function select(id: string) {
    // A transition tells React this update may wait: if the next person
    // suspends, React keeps the current one on screen (and `isPending` true)
    // instead of swapping it for the Suspense fallback.
    startTransition(() => setSelectedId(id));
  }

  return (
    <div className="layout">
      <PeopleList people={people} selectedId={selectedId} onSelect={select} />
      <PersonPanel id={selectedId} isPending={isPending} />
    </div>
  );
}
