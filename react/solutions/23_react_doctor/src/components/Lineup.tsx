import type { Person } from '../model/person';

interface LineupProps {
  people: Person[];
  onMove: (from: number, to: number) => void;
}

export function Lineup({ people, onMove }: LineupProps) {
  return (
    <section aria-labelledby="lineup-title">
      <h2 id="lineup-title">Lineup</h2>
      {people.length === 0 ? (
        <p>Your lineup is empty: add someone from the search.</p>
      ) : (
        <ol aria-label="Lineup">
          {people.map((person, index) => (
            // The key is the person, not the position: when a row moves, React
            // moves its DOM node — and the note typed into it — along with it.
            <li key={person.id}>
              <span>{person.name}</span>{' '}
              <input aria-label={`Note for ${person.name}`} placeholder="Why this pick?" />{' '}
              <button
                type="button"
                aria-label={`Move ${person.name} up`}
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${person.name} down`}
                disabled={index === people.length - 1}
                onClick={() => onMove(index, index + 1)}
              >
                ↓
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
