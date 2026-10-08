import { describe, it } from 'vitest';

// The list against the REAL fake server: `resetApi()` and a short
// `apiSettings.latencyMs` in a `beforeEach`, then `renderWithClient(IssueList)`.

describe('IssueList', () => {
  // TODO (step 2) — `list-loading` at once, then `issue-1` with `findByTestId`.
  it.todo('shows a loading state, then the open issues');

  // TODO (step 3) — `apiSettings.failNextRequest = true` before rendering, then
  // `list-error` with the server's message.
  it.todo('shows the error when the server fails');
});
