/**
 * Everything the app knows about fetching and changing issues lives here — the
 * components only ever call what this file exports.
 *
 * The key factory is given: every key the app uses starts with `issueKeys.all`,
 * which is what lets ONE `invalidateQueries({ queryKey: issueKeys.all })` hit
 * every list at once.
 */
import { queryOptions, useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createIssue,
  fetchIssues,
  setIssueStatus,
  type Issue,
  type IssueFilter,
  type IssueStatus,
} from '@/api/fakeApi';

export const issueKeys = {
  all: ['issues'] as const,
  list: (filter: IssueFilter) => [...issueKeys.all, filter] as const,
};

/** Key and fetcher travel together: no component can pair a key with the wrong fetcher. */
export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIssue,
    // Returning the promise keeps the mutation pending until the lists have
    // refetched: the button stays disabled until the new issue is on screen.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}

/** What a cached list looks like once the issue has changed status. */
function withStatus(issues: Issue[], id: number, status: IssueStatus, filter: IssueFilter): Issue[] {
  const updated = issues.map((issue) => (issue.id === id ? { ...issue, status } : issue));
  return filter === 'all' ? updated : updated.filter((issue) => issue.status === filter);
}

export function useSetIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: IssueStatus }) => setIssueStatus(id, status),

    onMutate: async ({ id, status }) => {
      // A refetch already in flight would land AFTER the optimistic write, and
      // put the old status back on screen.
      await queryClient.cancelQueries({ queryKey: issueKeys.all });

      const snapshot = queryClient.getQueriesData<Issue[]>({ queryKey: issueKeys.all });
      for (const [key, issues] of snapshot) {
        if (!issues) continue;
        const filter = key[1] as IssueFilter;
        queryClient.setQueryData<Issue[]>(key, withStatus(issues, id, status, filter));
      }
      // A list the issue is not in yet (the "closed" one, when you close it)
      // is left alone: `onSettled` refetches it.
      return { snapshot };
    },

    onError: (_error, _variables, onMutateResult) => {
      for (const [key, issues] of onMutateResult?.snapshot ?? []) {
        queryClient.setQueryData(key, issues);
      }
    },

    // Success or failure, the server has the last word. The promise is NOT
    // returned, unlike in `useCreateIssue`: the screen is already right (or
    // rolled back), so the mutation settles — and shows its error — now,
    // instead of staying pending until the refetch is back.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: issueKeys.all });
    },
  });
}
