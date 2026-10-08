import { useState, type FormEvent } from 'react';
import { useCreateIssue } from '../queries/issues';

export function NewIssueForm() {
  const [title, setTitle] = useState('');
  const { mutate, isPending, error } = useCreateIssue();

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    mutate({ title }, { onSuccess: () => setTitle('') });
  }

  return (
    <>
      {/* TODO (step 3): while `isPending`, show what the user sent — greyed out:
          <ul className="issues">
            <li className="pending" data-testid="pending-issue">{variables.title}</li>
          </ul> */}

      <form className="row" onSubmit={submit}>
        <input
          aria-label="Title of the new issue"
          placeholder="Title of the new issue"
          data-testid="new-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button type="submit" data-testid="create-submit" disabled={isPending}>
          {isPending ? 'Creating…' : 'Create'}
        </button>
        {error && (
          <p className="error" data-testid="create-error">
            {error.message}
          </p>
        )}
      </form>
    </>
  );
}
