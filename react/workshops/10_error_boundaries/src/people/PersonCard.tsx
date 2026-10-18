import type { Person } from '../model/person';

interface PersonCardProps {
  person: Person;
}

/** Trusts its data — and crashes on IG-88, whose `homeworld` is `null`. */
export function PersonCard({ person }: PersonCardProps) {
  return (
    <article className="card" aria-labelledby="person-name">
      <h2 id="person-name">{person.name}</h2>
      <dl>
        <dt>Height</dt>
        <dd>{person.height} cm</dd>
        <dt>Mass</dt>
        <dd>{person.mass} kg</dd>
        <dt>Homeworld</dt>
        <dd>{person.homeworld.name}</dd>
      </dl>
    </article>
  );
}
