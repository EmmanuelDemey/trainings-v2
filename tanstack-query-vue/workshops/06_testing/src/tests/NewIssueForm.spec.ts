import { describe, it } from 'vitest';

// The creation through the screen: `renderWithClient(App)` — the form AND the
// list — and `userEvent` to type and click.

describe('creating an issue', () => {
  // TODO (step 4) — `issue-43` shows up in the list, and `new-title` is cleared.
  it.todo('adds the new row to the list, and clears the input');

  // TODO (step 4) — with `apiSettings.failWrites`, `create-error` shows and
  // the title stays in the input.
  it.todo('keeps the title and shows the error when the server refuses');
});
