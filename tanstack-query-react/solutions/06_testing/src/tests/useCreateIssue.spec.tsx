import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { apiSettings, resetApi, type IssueSummary } from '../api/fakeApi';
import { issueKeys, useCreateIssue } from '../queries/issues';
import { createTestQueryClient, createWrapper } from './renderWithClient';

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});

/**
 * A hook in isolation: no component, no DOM. `renderHook` renders a tiny
 * component that calls it, inside the wrapper — the hook needs a
 * `QueryClientProvider` like any other.
 */
describe('useCreateIssue', () => {
  it('invalidates every issue query once the issue is created', async () => {
    const queryClient = createTestQueryClient();
    // A list already in the cache, as if a component had loaded it.
    queryClient.setQueryData<IssueSummary[]>(issueKeys.list('open'), []);
    // Spied for the length of this test only: `using` calls `mockRestore()`
    // when the block ends, pass or fail.
    using invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateIssue(), { wrapper: createWrapper(queryClient) });
    await act(() => result.current.mutateAsync({ title: 'Totals are rounded three times' }));

    // The hook's state reaches React a tick after the promise: wait for it.
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(43);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: issueKeys.all });
    // What the call DID: the cached list is now stale, waiting for a refetch.
    expect(queryClient.getQueryState(issueKeys.list('open'))?.isInvalidated).toBe(true);
  });

  it('exposes the error of a refused creation', async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useCreateIssue(), { wrapper: createWrapper(queryClient) });

    // `mutate`, not `mutateAsync`: it never rejects, the error lands in the state.
    act(() => result.current.mutate({ title: '   ' }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('A title is required');
  });
});
