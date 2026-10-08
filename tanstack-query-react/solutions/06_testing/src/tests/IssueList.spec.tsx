import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { apiSettings, resetApi, sent } from '../api/fakeApi';
import { IssueList } from '../components/IssueList';
import { renderWithClient } from './renderWithClient';

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});

describe('IssueList', () => {
  it('shows a loading state, then the open issues', async () => {
    renderWithClient(<IssueList />);

    // Synchronous: on the first render, nothing came back yet.
    expect(screen.getByTestId('list-loading')).toBeTruthy();

    // `findBy*` waits (1 s by default) — the server answers in 20 ms.
    expect(await screen.findByTestId('issue-1')).toBeTruthy();
    expect(screen.queryByTestId('list-loading')).toBeNull();
    // The closed issue #3 is not in the open list.
    expect(screen.queryByTestId('issue-3')).toBeNull();
    expect(sent('GET /issues?status=open')).toBe(1);
  });

  it('shows the error of the server — through the real API module', async () => {
    // The fake server's own switch: the request really goes out, really fails
    // with a 503, and the REAL error travels through `fetchIssues`, the query
    // and the component.
    apiSettings.failNextRequest = true;
    renderWithClient(<IssueList />);

    await waitForElementToBeRemoved(() => screen.queryByTestId('list-loading'));
    expect(screen.getByTestId('list-error').textContent).toContain('temporarily unavailable');
    // `retry: false` in the test client: one attempt, and the error at once.
    expect(sent('GET /issues?status=open')).toBe(1);
  });
});
