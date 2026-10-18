import { fetchPerson, likePerson } from '../api/people';
import { useFetch } from '../hooks/useFetch';

export function PersonDetail({ id }: { id: string }) {
  // TODO 3.3: replace `useFetch` with `usePerson(id)`.
  const { data: person, loading, error } = useFetch(() => fetchPerson(id), [id]);

  if (loading) return <p role="status">Loading the person…</p>;
  if (error || !person) return <p role="alert">Could not load this person.</p>;

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
      {/* TODO 4.2: the server counts the like, the screen does not change. Use
          `useLikePerson()`: `mutate(person.id)`, the button disabled and labelled
          'Liking…' while `isPending`, and a `role="alert"` when `isError`. */}
      <button type="button" onClick={() => void likePerson(person.id)}>
        {`Like ${person.name}`}
      </button>
    </article>
  );
}
