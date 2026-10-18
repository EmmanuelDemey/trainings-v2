import { useLikePerson, usePerson } from '../queries/people';

export function PersonDetail({ id }: { id: string }) {
  const { data: person, isPending, isError } = usePerson(id);
  const like = useLikePerson();

  if (isPending) return <p role="status">Loading the person…</p>;
  if (isError) return <p role="alert">Could not load this person.</p>;

  return (
    <article aria-labelledby="person-name" className="person">
      <h2 id="person-name">{person.name}</h2>
      <dl>
        <dt>Height</dt>
        <dd>{person.height} cm</dd>
        <dt>Mass</dt>
        <dd>{person.mass} kg</dd>
        <dt>Hair color</dt>
        <dd>{person.hairColor}</dd>
        <dt>Birth year</dt>
        <dd>{person.birthYear}</dd>
        <dt>Likes</dt>
        <dd>{person.likes}</dd>
      </dl>
      <button type="button" disabled={like.isPending} onClick={() => like.mutate(person.id)}>
        {like.isPending ? 'Liking…' : `Like ${person.name}`}
      </button>
      {like.isError && <p role="alert">The like was not saved, try again.</p>}
    </article>
  );
}
