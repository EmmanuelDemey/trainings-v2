import { useId } from 'react';
import type { Person } from '../model/person';
import { cx } from '../utils/cx';
import { formatHeight, formatMass } from '../utils/format';
import { HeightBar } from './HeightBar';
import styles from './PersonCard.module.scss';

type PersonCardProps = {
  person: Person;
  /** The tallest height in the list — the full width of the bar. */
  maxHeight: number;
};

export function PersonCard({ person, maxHeight }: PersonCardProps) {
  const titleId = useId();

  return (
    <article
      aria-labelledby={titleId}
      // A conditional class: `false` is dropped by `cx`.
      className={cx(styles.card, person.gender === 'n/a' && styles.droid)}
      // A data attribute describes STATE; CSS (`[data-gender='female']`) and
      // tests can both read it, without coupling to a class name.
      data-gender={person.gender}
    >
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
