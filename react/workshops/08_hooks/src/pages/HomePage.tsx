import { Input } from '../components/Input';
import { PeopleTable } from '../components/PeopleTable';
import { people } from '../data/people';

type HomePageProps = {
  onSelect: (personId: string) => void;
};

export function HomePage({ onSelect }: HomePageProps) {
  // TODO 1.1: keep the filter text in a state, and make the input controlled
  //           (`value` + `onChange`).
  // TODO 1.2: compute the visible people with `filterPeople` — derived during
  //           the render, wrapped in `useMemo` keyed on the query.
  // TODO 4.1: focus the filter when the page mounts — a `useRef` passed as the
  //           `ref` prop of <Input>, and an effect.
  return (
    <>
      <h1>Star Wars people</h1>
      <Input label="Filter by name" type="search" />
      <PeopleTable people={people} onSelect={onSelect} />
    </>
  );
}
