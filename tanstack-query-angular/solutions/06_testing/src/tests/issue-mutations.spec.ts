import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { apiSettings, resetApi } from '../api/fakeApi';
import { injectCreateIssue } from '../app/issues/issue-mutations';
import { issueKeys } from '../app/issues/issue-queries';
import { createTestQueryClient } from './render-with-client';

beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});

describe('injectCreateIssue, without a component', () => {
  it('creates the issue, then invalidates every issue query', async () => {
    const queryClient = createTestQueryClient();
    TestBed.configureTestingModule({ providers: [provideTanStackQuery(queryClient)] });
    // `using`: the spy is restored (`mockRestore()`) when the test's scope
    // ends — no `afterEach` to forget.
    using invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    // An inject function needs an injection context: TestBed lends its own,
    // the way a field initializer does in a component.
    const createIssue = TestBed.runInInjectionContext(() => injectCreateIssue());
    createIssue.mutate('Totals are rounded three times');

    await vi.waitFor(() => expect(createIssue.isSuccess()).toBe(true));
    expect(createIssue.data()?.id).toBe(43);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: issueKeys.all });
  });
});
