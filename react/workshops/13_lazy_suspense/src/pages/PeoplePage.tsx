import { useState } from 'react';
import { PeopleList } from '../components/PeopleList';
import { PersonPanel } from '../components/PersonPanel';
import { people } from '../data/people';

export function PeoplePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // TODO 5.1: get `[isPending, startTransition]` from `useTransition()`, make
  //   the selection a transition, and pass `isPending` to the panel — so the
  //   current person stays on screen while the next one loads.
  function select(id: string) {
    setSelectedId(id);
  }

  return (
    <div className="layout">
      <PeopleList people={people} selectedId={selectedId} onSelect={select} />
      <PersonPanel id={selectedId} isPending={false} />
    </div>
  );
}
