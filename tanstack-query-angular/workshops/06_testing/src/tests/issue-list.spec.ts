import { describe, it } from 'vitest';

// Use `renderWithClient` (./render-with-client.ts), `screen` from
// '@testing-library/angular', and the fake server's `resetApi()` /
// `apiSettings` in a `beforeEach`.
describe('IssueList', () => {
  // TODO (step 2): "Loading…" right after the render (`getBy*`), then the open
  // issues (`findBy*`) — and why `getBy*` for the first, `findBy*` for the second.
  it.todo('shows "Loading…" first, then the open issues');

  // TODO (step 3): `apiSettings.failNextRequest = true` before the render, then
  // find `list-error`.
  it.todo('shows the error when the server fails — the real API, with its switch');
});
