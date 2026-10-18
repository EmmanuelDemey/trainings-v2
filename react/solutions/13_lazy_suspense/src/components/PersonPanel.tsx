import { Suspense } from 'react';
import { forgetPerson } from '../api/people';
import { ErrorBoundary } from './ErrorBoundary';
import { Loader } from './Loader';
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
        // The boundary stays mounted from one person to the next — NOT a
        // `key={id}`: a remounted <Suspense> always shows its fallback, which
        // would defeat the transition of step 5. `resetKeys` clears an error
        // when another person is picked instead.
        <ErrorBoundary
          resetKeys={[id]}
          fallback={({ error, reset }) => (
            <div role="alert" className="error">
              <p>Could not load this person.</p>
              <p>{error.message}</p>
              <button
                type="button"
                onClick={() => {
                  // Forget the rejected promise first, or the retry re-reads it.
                  forgetPerson(id);
                  reset();
                }}
              >
                Try again
              </button>
            </div>
          )}
        >
          <Suspense fallback={<Loader label="Loading person…" />}>
            <PersonDetails id={id} />
          </Suspense>
        </ErrorBoundary>
      )}
    </section>
  );
}
