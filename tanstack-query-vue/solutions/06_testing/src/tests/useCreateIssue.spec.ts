import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiSettings, resetApi } from '@/api/fakeApi';
import { issueKeys, useCreateIssue } from '@/queries/issues';
import { withSetup } from './withSetup';

/**
 * The composable on its own, in a host component (`withSetup`): no template,
 * no clicks — its contract is what it does to the server and to the cache.
 */

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 10;
});

describe('useCreateIssue', () => {
  it('creates the issue, then invalidates every issue query', async () => {
    const { result, queryClient } = withSetup(() => useCreateIssue());
    // `using`: the spy is restored (`mockRestore()`) when this block ends,
    // pass or fail — no `afterEach`, no forgotten restore.
    using invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    const issue = await result.mutateAsync({ title: 'Totals are rounded three times' });

    expect(issue.id).toBe(43);
    // `data` is a ref: the composable's state, as a component would read it.
    expect(result.data.value?.title).toBe('Totals are rounded three times');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: issueKeys.all });
  });

  it('invalidates nothing when the server refuses', async () => {
    const { result, queryClient } = withSetup(() => useCreateIssue());
    using invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    apiSettings.failWrites = true;

    await expect(result.mutateAsync({ title: 'Totals are rounded three times' })).rejects.toThrow('refused');

    expect(result.error.value?.message).toContain('refused');
    expect(invalidate).not.toHaveBeenCalled();
  });
});
