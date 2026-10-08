/**
 * Everything the app knows about reading AND changing issues lives here —
 * including the cache surgery of the optimistic update, which no component
 * should ever have to read.
 */
import { queryOptions, useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createIssue,
  fetchIssues,
  updateIssue,
  type IssueFilter,
  type IssueStatus,
  type IssueSummary,
} from '@/api/fakeApi';

export const FILTERS: readonly IssueFilter[] = ['open', 'closed', 'all'];

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
};

export const issueMutationKeys = {
  all: ['issues'] as const,
  create: () => [...issueMutationKeys.all, 'create'] as const,
  toggle: () => [...issueMutationKeys.all, 'toggle'] as const,
};

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

/**
 * Optimistic through the UI: nothing is written to the cache. The form shows
 * the mutation's `variables` while it is pending (see NewIssueForm.vue).
 */
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.create(),
    mutationFn: createIssue,
    // RETURNED: the mutation stays pending — and the greyed-out row on screen
    // — until the lists are refetched and the real row is there. Without the
    // `return`, the pending row would vanish a round trip before the real one
    // appears.
    onSettled: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  });
}

/**
 * A cached list once issue `id` has changed status. Immutable: new arrays,
 * new objects — the snapshot keeps the references to the old ones, and the
 * rollback needs them untouched. The issue leaves the list of a status it no
 * longer has; a list it now belongs to is left for `onSettled` to refetch.
 */
function applyStatus(issues: IssueSummary[], id: number, status: IssueStatus, filter: IssueFilter): IssueSummary[] {
  const changed = issues.map((issue) => (issue.id === id ? { ...issue, status } : issue));
  return filter === 'all' ? changed : changed.filter((issue) => issue.status === filter);
}

/**
 * Optimistic through the cache: every list on screen changes the moment you
 * click, and goes back if the server says no.
 */
export function useToggleIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: issueMutationKeys.toggle(),
    mutationFn: ({ id, status }: { id: number; status: IssueStatus }) => updateIssue(id, { status }),

    onMutate: async ({ id, status }) => {
      // 1. A refetch already in flight would land AFTER the optimistic write,
      //    and put the old status back on screen. Cancel it first.
      await queryClient.cancelQueries({ queryKey: issueKeys.all });

      // 2. The snapshot: every cached list, as it is now — what `onError`
      //    puts back.
      const snapshot = queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() });

      // 3. The write, into every cached list. `setQueriesData` would apply
      //    ONE updater to all of them — but the updater does not get the key,
      //    and here the filter of each list matters. Hence one `setQueryData`
      //    per entry of the snapshot.
      for (const [queryKey, issues] of snapshot) {
        if (!issues) continue;
        const filter = queryKey[2] as IssueFilter; // ['issues', 'list', filter]
        queryClient.setQueryData<IssueSummary[]>(queryKey, applyStatus(issues, id, status, filter));
      }

      // 4. Whatever `onMutate` returns reaches `onError` and `onSettled`.
      return { snapshot };
    },

    // The rollback: put back every list of the snapshot.
    onError: (_error, _variables, onMutateResult) => {
      for (const [queryKey, issues] of onMutateResult?.snapshot ?? []) {
        queryClient.setQueryData(queryKey, issues);
      }
    },

    // Success or failure, the server has the last word. NOT returned: the
    // screen is already right (or rolled back), so the mutation settles —
    // and shows its error — now, instead of waiting for the refetch.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: issueKeys.all });
    },
  });
}
