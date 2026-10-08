import { describe, it } from 'vitest';

// Your tests. Each `it.todo` is a test to write: replace it with an `it(…)`.
// Reset the fake server before each test (`resetApi()`), and make it fast
// (`apiSettings.latencyMs = 20`).

describe('IssueList', () => {
  // TODO (2): `renderWithClient(<IssueList />)`, `list-loading` at once, then
  // `issue-1` with `findByTestId` — and `list-loading` gone.
  it.todo('shows a loading state, then the open issues');

  // TODO (3): `apiSettings.failNextRequest = true` before rendering, then
  // `list-error` and the message of the server.
  it.todo('shows the error of the server — through the real API module');
});

// TODO (3): the same error, with `vi.mock('../api/fakeApi', …)` replacing
// `fetchIssues` — in a file of its own, `IssueList.mocked.spec.tsx`: why?
