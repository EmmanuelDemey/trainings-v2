import { useState, type FormEvent } from 'react';
import { useCreateIssue } from '../queries/issues';

export function NewIssueForm() {
  const [title, setTitle] = useState('');
  const { mutate, isPending, variables, error } = useCreateIssue();

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    mutate({ title }, { onSuccess: () => setTitle('') });
  }

  return (
    <>
      {/* Optimistic through the UI: no id yet, no cache write — just what the
          user sent, greyed out, while the mutation is pending. Nothing to roll
          back: once it settles, the row is gone, and the real one (or the error)
          is there. */}
      {isPending && (
        <ul className="issues">
          <li className="pending" data-testid="pending-issue">
            <span>{variables.title}</span>
            <span className="muted">creating…</span>
          </li>
        </ul>
      )}

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
