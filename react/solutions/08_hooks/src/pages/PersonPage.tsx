import { useEffect } from 'react';
import { LikeButton } from '../components/LikeButton';
import { people } from '../data/people';
import { formatHeight, formatMass } from '../utils/format';

type PersonPageProps = {
  personId: string;
  onBack: () => void;
};

export function PersonPage({ personId, onBack }: PersonPageProps) {
  const person = people.find(({ id }) => id === personId);

  // Synchronising with something OUTSIDE React — the tab title — is exactly
  // what an effect is for. The cleanup puts back what was there, so leaving
  // the page leaves no trace. The dependency is the name: the title only has
  // to change when it does.
  const name = person?.name;
  useEffect(() => {
    if (name === undefined) return;
    const previousTitle = document.title;
    document.title = `${name} — Star Wars people`;
    return () => {
      document.title = previousTitle;
    };
  }, [name]);

  return (
    <article className="person">
      <button type="button" onClick={onBack}>
        Home
      </button>
      {person ? (
        <>
          <h1>{person.name}</h1>
          <dl>
            <dt>Height</dt>
            <dd>{formatHeight(person.height)}</dd>
            <dt>Mass</dt>
            <dd>{formatMass(person.mass)}</dd>
            <dt>Birth year</dt>
            <dd>{person.birthYear}</dd>
            <dt>Eye colour</dt>
            <dd>{person.eyeColor}</dd>
          </dl>
          {/* The key resets the button's state when the person changes. */}
          <LikeButton key={person.id} name={person.name} />
        </>
      ) : (
        <p role="alert">Character not found.</p>
      )}
    </article>
  );
}
