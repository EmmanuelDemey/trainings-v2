import { useEffect, useState } from 'react';
import { fetchPeople } from '../api/people';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import type { Person } from '../model/person';
import { PeopleTable } from './PeopleTable';

interface PeopleTableContainerProps {
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

/**
 * The "container" half of the container / presentational split: it owns the
 * request and its three states, and hands the data to PeopleTable.
 */
export function PeopleTableContainer({ selectedId, onSelect }: PeopleTableContainerProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Bumping this number re-runs the effect: that is all "Retry" needs.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchPeople(controller.signal)
      .then(setPeople)
      .catch((reason: unknown) => {
        // The rejection of a request WE aborted is not an error to show.
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // StrictMode mounts, unmounts and remounts in dev: the first request is
    // aborted here, so only the second one updates the state.
    return () => controller.abort();
  }, [attempt]);

  if (loading) {
    return <Loader label="Loading the characters…" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} onRetry={() => setAttempt((n) => n + 1)} />;
  }

  return <PeopleTable people={people} selectedId={selectedId} onSelect={onSelect} />;
}
