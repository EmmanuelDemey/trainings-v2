import { useEffect, useState } from 'react';
import { fetchPerson } from '../api/people';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import type { Person as PersonModel } from '../model/person';
import { Person } from './Person';

interface PersonContainerProps {
  id: string;
}

export function PersonContainer({ id }: PersonContainerProps) {
  const [person, setPerson] = useState<PersonModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // One controller per run of the effect, i.e. per id.
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchPerson(id, controller.signal)
      .then(setPerson)
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // The race: click Luke, then Leia before Luke's response is back. Without
    // this cleanup, Luke's late response would overwrite Leia's. Aborting the
    // previous request when `id` changes (or on unmount) makes it impossible —
    // and it frees the connection, which an `ignore` flag alone would not.
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <Loader label="Loading the character…" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return person && <Person person={person} />;
}
