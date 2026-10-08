import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ApiError, fetchIssues } from '../api/fakeApi';
import { IssueList } from '../components/IssueList';
import { renderWithClient } from './renderWithClient';

/**
 * The same error state, with the API module mocked. `vi.mock` is hoisted above
 * the imports and applies to the WHOLE file — which is why this test has a file
 * of its own.
 *
 * It tests less than the one in `IssueList.spec.tsx`: the component gets the
 * error you wrote here, not the one the API really throws. Rename the message
 * in `fakeApi.ts`, break `fetchIssues`, change its signature: this test stays
 * green. Mock a module when there is no other way to reach a state — a real
 * backend you cannot switch, a timeout you cannot wait for — not by default.
 */
vi.mock('../api/fakeApi', async (importOriginal) => ({
  // Everything real — `ApiError` included — except the one function replaced.
  ...(await importOriginal<typeof import('../api/fakeApi')>()),
  fetchIssues: vi.fn(),
}));

describe('IssueList, with the API module mocked', () => {
  it('shows the error the query function rejects with', async () => {
    vi.mocked(fetchIssues).mockRejectedValue(new ApiError(500, 'The mocked server exploded'));

    renderWithClient(<IssueList />);

    expect((await screen.findByTestId('list-error')).textContent).toContain('The mocked server exploded');
    expect(fetchIssues).toHaveBeenCalledWith('open');
  });
});
