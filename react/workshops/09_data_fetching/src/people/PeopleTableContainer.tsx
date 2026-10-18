import { PeopleTable } from './PeopleTable';

interface PeopleTableContainerProps {
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

/**
 * The "container" half of the container / presentational split: it owns the
 * request and its three states, and hands the data to PeopleTable.
 */
export function PeopleTableContainer({ selectedId, onSelect }: PeopleTableContainerProps) {
  // TODO 4.1: three pieces of state — `people`, `loading` (starts true), `error`.
  // TODO 4.2: in a `useEffect`, load them with `fetchPeople()` (src/api/people.ts).
  // TODO 4.3: render <Loader> while loading, <ErrorMessage> on error.
  // TODO 4.4: Retry — an `attempt` counter in the state and in the effect's dependencies.
  // TODO 4.5: abort the request in the effect cleanup, and ignore the rejection it causes.
  return <PeopleTable people={[]} selectedId={selectedId} onSelect={onSelect} />;
}
