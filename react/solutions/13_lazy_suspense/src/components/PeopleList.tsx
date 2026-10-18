import type { Person } from '../model/person';

interface PeopleListProps {
  people: Person[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PeopleList({ people, selectedId, onSelect }: PeopleListProps) {
  return (
    <ul className="people" aria-label="People">
      {people.map((person) => (
        <li key={person.id}>
          <button
            type="button"
            aria-pressed={person.id === selectedId}
            onClick={() => onSelect(person.id)}
          >
            {person.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
