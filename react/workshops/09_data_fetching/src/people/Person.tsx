import type { Person as PersonModel } from '../model/person';

interface PersonProps {
  person: PersonModel;
}

/** The details of one character. Presentational, like PeopleTable. */
export function Person({ person }: PersonProps) {
  return (
    <article className="person" aria-labelledby="person-name">
      <h2 id="person-name">{person.name}</h2>
      <dl>
        <dt>Height</dt>
        <dd>{person.height} cm</dd>
        <dt>Mass</dt>
        <dd>{person.mass} kg</dd>
        <dt>Hair colour</dt>
        <dd>{person.hairColor}</dd>
        <dt>Eye colour</dt>
        <dd>{person.eyeColor}</dd>
        <dt>Birth year</dt>
        <dd>{person.birthYear}</dd>
        <dt>Gender</dt>
        <dd>{person.gender}</dd>
      </dl>
    </article>
  );
}
