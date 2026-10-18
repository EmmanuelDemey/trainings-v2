import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '../components/Input';
import { PeopleTable } from '../components/PeopleTable';
import { people } from '../data/people';
import { filterPeople } from '../utils/filterPeople';

type HomePageProps = {
  onSelect: (personId: string) => void;
};

export function HomePage({ onSelect }: HomePageProps) {
  // The input's text is STATE: changing it must re-render the table.
  const [query, setQuery] = useState('');

  // DERIVED from state and props: computed during render, never stored in a
  // second state kept in sync by an effect. `useMemo` only skips the work when
  // `query` did not change — on ten people it is a demo, on ten thousand it
  // starts to matter. Measure before you memoise.
  const visiblePeople = useMemo(() => filterPeople(people, query), [query]);

  // A ref holds the DOM node: reading or writing it does not re-render.
  const filterRef = useRef<HTMLInputElement>(null);

  // Focusing is a side effect on the DOM, which only exists AFTER the render:
  // that is what effects are for. `[]`: once, when the page mounts.
  useEffect(() => {
    filterRef.current?.focus();
  }, []);

  return (
    <>
      <h1>Star Wars people</h1>
      <Input
        ref={filterRef}
        label="Filter by name"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <PeopleTable people={visiblePeople} onSelect={onSelect} />
    </>
  );
}
