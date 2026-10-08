import { useState, type FormEvent } from 'react';
import { createIssue } from '../api/fakeApi';

export function NewIssueForm() {
  const [title, setTitle] = useState('');

  // TODO (step 1): `const { mutate, isPending, error } = useCreateIssue();` —
  // and this component no longer imports anything from '../api/fakeApi'.
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    // The server creates the issue… and nobody else hears about it: the list
    // and the counter keep what they had in the cache. A refused write throws,
    // and nothing shows it.
    // TODO (step 2): `mutate({ title }, { onSuccess: () => setTitle('') })` —
    // clear the input only once the server accepted.
    await createIssue({ title });
    setTitle('');
  }

  return (
    <form className="row" onSubmit={(event) => void submit(event)}>
      <input
        aria-label="Title of the new issue"
        placeholder="Title of the new issue"
        data-testid="new-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      {/* TODO (step 3): disabled while `isPending`. */}
      <button type="submit" data-testid="create-submit">
        Create
      </button>
      {/* TODO (step 2): `error.message` in a <p className="error" data-testid="create-error">. */}
    </form>
  );
}
