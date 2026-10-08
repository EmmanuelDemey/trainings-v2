import { useState, type FormEvent } from 'react';
import { useCreateIssue } from '../queries/issues';

export function NewIssueForm() {
  const [title, setTitle] = useState('');
  const { mutate, isPending, error } = useCreateIssue();

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    // Two kinds of callbacks. The hook's `onSuccess` (in queries/issues.ts)
    // keeps the CACHE right, whoever calls it. This one is about THIS form:
    // clear the input once the server accepted — a refused write keeps what
    // the user typed. It only runs if the component is still mounted.
    mutate({ title }, { onSuccess: () => setTitle('') });
  }

  return (
    <form className="row" onSubmit={submit}>
      <input
        aria-label="Title of the new issue"
        placeholder="Title of the new issue"
        data-testid="new-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      {/* `isPending` — no `useState` to keep in sync by hand. */}
      <button type="submit" data-testid="create-submit" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create'}
      </button>
      {/* Reset on the next `mutate`: a new attempt starts without the old error. */}
      {error && (
        <p className="error" data-testid="create-error">
          {error.message}
        </p>
      )}
    </form>
  );
}
