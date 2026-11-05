import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { getJson } from '../api/http';
import type { Person } from '../model/person';
import { SafeHtml } from '../security/SafeHtml';
import { safeUrl } from '../security/safeUrl';

export async function personLoader({ params, request }: LoaderFunctionArgs) {
  // TODO 3.3: protect this loader too.
  return getJson<Person>(`/api/people/${params.id}`, request.signal);
}

export function PersonPage() {
  const person = useLoaderData<typeof personLoader>();
  const homepage = safeUrl(person.homepage);

  return (
    <article aria-labelledby="person-name">
      <h1 id="person-name">{person.name}</h1>
      <p>Born {person.birthYear}</p>
      <h2>Biography</h2>
      {/* Written by the fans: sanitised before it reaches the DOM. */}
      <SafeHtml html={person.bio} className="bio" />
      {/* TODO 6.3: `rel="noopener noreferrer"` — or the opened page gets
          `window.opener`, and can navigate THIS tab to a fake login page. */}
      {homepage ? (
        <a href={homepage} target="_blank">
          Homepage
        </a>
      ) : (
        <p>No valid homepage.</p>
      )}
      <p>
        <Link to="/">Back to the people</Link>
      </p>
    </article>
  );
}
