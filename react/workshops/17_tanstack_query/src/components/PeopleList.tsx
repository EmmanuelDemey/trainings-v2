import { fetchPeople } from '../api/people';
import { useFetch } from '../hooks/useFetch';

type Props = { selectedId: string | null; onSelect: (id: string) => void };

export function PeopleList({ selectedId, onSelect }: Props) {
  // TODO 3.2: replace `useFetch` with `usePeople()` — `isPending` / `isError` / `data`.
  const { data: people, loading, error } = useFetch(() => fetchPeople(), []);

  if (loading) return <p role="status">Loading the people…</p>;
  if (error || !people) return <p role="alert">Could not load the people.</p>;

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
