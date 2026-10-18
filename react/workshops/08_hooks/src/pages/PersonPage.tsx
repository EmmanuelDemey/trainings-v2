import { LikeButton } from '../components/LikeButton';
import { people } from '../data/people';
import { formatHeight, formatMass } from '../utils/format';

type PersonPageProps = {
  personId: string;
  onBack: () => void;
};

export function PersonPage({ personId, onBack }: PersonPageProps) {
  const person = people.find(({ id }) => id === personId);

  // TODO 3.1: an effect that sets `document.title` to
  //           "Luke Skywalker — Star Wars people" for the person shown…
  // TODO 3.2: …and whose cleanup puts back the title that was there before.
  // TODO 3.3: pick the dependency so the title follows a change of person.

  // TODO 2.4: the Home button calls `onBack`.
  return (
    <article className="person">
      <button type="button">Home</button>
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
          <LikeButton key={person.id} name={person.name} />
        </>
      ) : (
        <p role="alert">Character not found.</p>
      )}
    </article>
  );
}
