import { useEffect, useState } from 'react';
import { fetchPerson } from '../api/people';
import type { Person as PersonModel } from '../model/person';
import { Person } from './Person';

interface PersonContainerProps {
  id: string;
}

export function PersonContainer({ id }: PersonContainerProps) {
  const [person, setPerson] = useState<PersonModel | null>(null);

  useEffect(() => {
    // TODO 5.1: a loading state (<Loader>) and an error state (<ErrorMessage>).
    // TODO 5.2: this works… until two responses arrive in the wrong order. Create
    // an AbortController, pass its signal to `fetchPerson`, abort it in the cleanup.
    // TODO 5.3: ignore the rejection of the request you aborted.
    void fetchPerson(id).then(setPerson);
  }, [id]);

  return person && <Person person={person} />;
}
