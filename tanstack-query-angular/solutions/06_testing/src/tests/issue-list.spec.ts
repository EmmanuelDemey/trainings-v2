import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/angular';
import { apiSettings, resetApi } from '../api/fakeApi';
import { IssueList } from '../app/issues/issue-list';
import { renderWithClient } from './render-with-client';

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});

describe('IssueList', () => {
  it('shows "Loading…" first, then the open issues', async () => {
    await renderWithClient(IssueList);

    // Synchronous: right after the render, nothing has come back yet.
    expect(screen.getByTestId('list-loading')).toBeTruthy();

    // `findBy*` waits (1 s by default) — the data is asynchronous, the test too.
    expect(await screen.findByTestId('issue-1')).toBeTruthy();
    expect(screen.queryByTestId('list-loading')).toBeNull();
    // Issue 3 is closed: not in the default filter.
    expect(screen.queryByTestId('issue-3')).toBeNull();
  });

  it('shows the error when the server fails — the real API, with its switch', async () => {
    // The fake server's own switch: the request really goes through
    // `fetchIssues`, is logged, and fails with the server's `ApiError`.
    apiSettings.failNextRequest = true;

    await renderWithClient(IssueList);

    expect((await screen.findByTestId('list-error')).textContent).toContain('temporarily unavailable');
  });
});
