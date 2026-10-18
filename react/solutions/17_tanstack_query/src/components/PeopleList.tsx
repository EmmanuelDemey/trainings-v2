import { usePeople } from '../queries/people';

type Props = { selectedId: string | null; onSelect: (id: string) => void };

export function PeopleList({ selectedId, onSelect }: Props) {
  // `isPending`: no data yet. `isFetching` would also be true during the
  // background refreshes — the list must not blink every 10 s.
  const { data: people, isPending, isError } = usePeople();

  if (isPending) return <p role="status">Loading the people…</p>;
  if (isError) return <p role="alert">Could not load the people.</p>;

  return (
    <ul aria-label="People" className="people">
      {people.map((person) => (
        <li key={person.id}>
          <button type="button" aria-pressed={person.id === selectedId} onClick={() => onSelect(person.id)}>
            {person.name}
          </button>
          <span className="likes">{person.likes} likes</span>
        </li>
      ))}
    </ul>
  );
}
