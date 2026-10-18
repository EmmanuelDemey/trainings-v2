import { useState } from 'react';
import type { Person } from '../model/person';
import { pickRandom } from '../utils/random';

type RandomPersonProps = {
  people: readonly Person[];
};

export function RandomPerson({ people }: RandomPersonProps) {
  const [picked, setPicked] = useState<Person | null>(null);

  return (
    <section aria-label="Random person">
      <button type="button" onClick={() => setPicked(pickRandom(people))}>
        Pick a random person
      </button>
      {picked && <p>Your random person: {picked.name}</p>}
    </section>
  );
}
