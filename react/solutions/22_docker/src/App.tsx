import { getConfig } from './config';
import { people } from './data/people';

/** `/people/:id` → the id, anything else → null. No router needed for one route. */
function personIdFrom(pathname: string): string | null {
  return /^\/people\/([^/]+)\/?$/.exec(pathname)?.[1] ?? null;
}

export function App() {
  const config = getConfig();
  const personId = personIdFrom(window.location.pathname);
  const person = people.find(({ id }) => id === personId);

  return (
    <main>
      <h1>Star Wars people</h1>

      <section aria-labelledby="deployment-title">
        <h2 id="deployment-title">Deployment</h2>
        <dl>
          <dt>API base URL</dt>
          <dd>{config.apiBaseUrl}</dd>
          <dt>Environment</dt>
          <dd>{config.environment}</dd>
        </dl>
      </section>

      {personId === null ? (
        <section aria-labelledby="people-title">
          <h2 id="people-title">People</h2>
          <ul>
            {people.map(({ id, name }) => (
              <li key={id}>
                {/* A plain link on purpose: every click is a full page load of a
                    deep link — exactly what the SPA fallback has to serve. */}
                <a href={`/people/${id}`}>{name}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section aria-labelledby="person-title">
          <h2 id="person-title">{person?.name ?? 'Unknown person'}</h2>
          {person && (
            <dl>
              <dt>Height</dt>
              <dd>{person.height} cm</dd>
              <dt>Birth year</dt>
              <dd>{person.birthYear}</dd>
            </dl>
          )}
          <a href="/">Back to the list</a>
        </section>
      )}
    </main>
  );
}
