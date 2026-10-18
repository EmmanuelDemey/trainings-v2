import { use } from 'react';
import { getPerson } from '../api/people';

interface PersonDetailsProps {
  id: string;
}

export function PersonDetails({ id }: PersonDetailsProps) {
  // `use()` reads the promise: while it is pending, the component SUSPENDS and
  // the closest <Suspense> shows its fallback; once it rejects, the closest
  // error boundary catches. Unlike a hook, `use` may be called conditionally.
  const person = use(getPerson(id));

  return (
    <article aria-labelledby="person-name">
      <h2 id="person-name">{person.name}</h2>
      <dl>
        <dt>Height</dt>
        <dd>{person.height} cm</dd>
        <dt>Mass</dt>
        <dd>{person.mass} kg</dd>
        <dt>Birth year</dt>
        <dd>{person.birthYear}</dd>
        <dt>Eye colour</dt>
        <dd>{person.eyeColor}</dd>
      </dl>
    </article>
  );
}
