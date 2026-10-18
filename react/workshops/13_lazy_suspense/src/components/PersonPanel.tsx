import { PersonDetails } from './PersonDetails';

interface PersonPanelProps {
  id: string | null;
  /** True while a transition is preparing the next person. */
  isPending: boolean;
}

export function PersonPanel({ id, isPending }: PersonPanelProps) {
  return (
    <section className="panel" aria-label="Person details" aria-busy={isPending}>
      {id === null ? (
        <p>Select a person to see their details.</p>
      ) : (
        // TODO 3.2: wrap <PersonDetails> in a <Suspense> whose fallback is
        //   <Loader label="Loading person…" />.
        //
        // TODO 4.1: wrap that <Suspense> in the given <ErrorBoundary>, with
        //   `resetKeys={[id]}` (NOT `key={id}` — see the README, step 5) and a
        //   `fallback` rendering a role="alert" block with
        //   "Could not load this person.", the error message, and a
        //   "Try again" button.
        // TODO 4.2: "Try again" calls `forgetPerson(id)` THEN `reset()`.
        <PersonDetails id={id} />
      )}
    </section>
  );
}
