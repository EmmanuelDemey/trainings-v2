// TODO 3.2: export a `personLoader({ params, request }: LoaderFunctionArgs)`:
//   - `fetchPerson(params.id!, request.signal)` (from '../api/people')
//   - when it gives `null`, THROW `data(\`No person with id ${params.id}.\`, { status: 404 })`
//   - otherwise return the person.

export function PersonPage() {
  // TODO 3.2: read the person with `useLoaderData<typeof personLoader>()` and render
  //   <article aria-labelledby="person-name">
  //     <h1 id="person-name">{name}</h1>
  //     <dl> Height "202 cm", Mass "136 kg", Birth year </dl>
  //     a "Back" button calling `navigate(-1)` (`useNavigate()`)
  //   </article>
  return <p>TODO: the person page</p>;
}
