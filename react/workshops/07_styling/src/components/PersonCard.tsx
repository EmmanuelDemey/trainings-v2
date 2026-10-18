import { useId } from 'react';
import type { Person } from '../model/person';
import { formatHeight, formatMass } from '../utils/format';
import { HeightBar } from './HeightBar';

type PersonCardProps = {
  person: Person;
  /** The tallest height in the list — the full width of the bar. */
  maxHeight: number;
};

export function PersonCard({ person, maxHeight }: PersonCardProps) {
  const titleId = useId();

  // TODO 3.3: import `./PersonCard.module.scss` as `styles`, give the article
  //           `styles.card`, plus `styles.droid` when the gender is 'n/a'.
  // TODO 3.4: expose the gender in a `data-gender` attribute.
  return (
    <article aria-labelledby={titleId}>
      <h2 id={titleId}>{person.name}</h2>
      <dl>
        <dt>Height</dt>
        <dd>{formatHeight(person.height)}</dd>
        <dt>Mass</dt>
        <dd>{formatMass(person.mass)}</dd>
        <dt>Born</dt>
        <dd>{person.birthYear}</dd>
      </dl>
      <HeightBar height={person.height} max={maxHeight} />
    </article>
  );
}
