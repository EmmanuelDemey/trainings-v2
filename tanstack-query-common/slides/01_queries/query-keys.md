# Query keys

A **query key** identifies one entry of the cache. It is always an **array**:

```ts
// From the most general to the most specific
['issues']                              // the root of everything about issues
['issues', 'list', 'open']              // one filter of the list
['issues', 'list', { status: 'open', assignee: 'Ada' }]   // objects are fine
['issues', 'detail', 42]                // one issue
['activity', 'feed']                    // the activity feed
```

- **Serialisable** values only: strings, numbers, booleans, `null`, plain
  objects and arrays — no class instances, no functions, no `Date` you expect
  to compare by value
- The key is **hashed** into a string, the `queryHash` — that string is the real
  key of the cache's `Map`
- Two calls with **equal** keys (by value, not by reference) share **one entry**

---

# Deterministic hashing

```ts
import { hashKey } from '@tanstack/query-core';

hashKey(['issues', { status: 'open', page: 1 }]);
// '["issues",{"page":1,"status":"open"}]'
hashKey(['issues', { page: 1, status: 'open' }]);
// '["issues",{"page":1,"status":"open"}]'   ← same hash: object keys are sorted

hashKey(['issues', 'open', 1]);   // '["issues","open",1]'
hashKey(['issues', 1, 'open']);   // '["issues",1,"open"]'  ← different: array order matters

hashKey(['issues', { assignee: undefined }]);  // '["issues",{}]' — undefined properties vanish
```

| | Order matters? |
|---|---|
| Items of the **array** | **Yes** — `['issues', 1]` ≠ `[1, 'issues']` |
| Properties of an **object** in the key | **No** — they are sorted before hashing |

- A new array literal on every render is **fine**: identity is never compared,
  only the hash
- `queryKeyHashFn` lets you replace the hash function — you almost never need it

---

# Keys are hierarchical

```text
the keys in the cache, as a prefix tree

['issues']
├── ['issues', 'list']
│   ├── ['issues', 'list', 'open']
│   ├── ['issues', 'list', 'closed']
│   └── ['issues', 'list', 'all']
├── ['issues', 'page', 1]  ['issues', 'page', 2]  …
└── ['issues', 'detail']
    ├── ['issues', 'detail', 1]
    └── ['issues', 'detail', 42]
```

Every `queryClient` method that takes **filters** matches by **prefix**:

```ts
queryClient.invalidateQueries({ queryKey: ['issues'] });                  // everything above
queryClient.invalidateQueries({ queryKey: ['issues', 'list'] });          // the three lists
queryClient.invalidateQueries({ queryKey: ['issues', 'detail', 42] });    // one issue (+ anything under it)
queryClient.invalidateQueries({ queryKey: ['issues', 'list'], exact: true }); // only that exact key
```

- Design keys from the **general** to the **specific**: what you will want to
  invalidate **together** shares a prefix
- An object in the key matches **partially**: `{ queryKey: ['issues', { status: 'open' }] }`
  also matches `['issues', { status: 'open', page: 2 }]`

---

# Everything the `queryFn` reads goes in the key

```ts
// ❌ the filter is not in the key
{ queryKey: ['issues'], queryFn: () => fetchIssues(filter) }
```

- Switching from *open* to *closed* does **not** change the key: no refetch, and
  the *closed* answer would land in the **same entry** as *open*
- The cache would hold **one** list for **three** different requests

```ts
// ✅ the key describes the request completely
{ queryKey: ['issues', 'list', filter], queryFn: () => fetchIssues(filter) }
```

- When `filter` changes, the key changes → **another entry**: fetched if missing,
  served at once if cached
- The previous entry **stays** in the cache — coming back to it is instant
- Think of the key as the **dependency array** of the query function. The
  ESLint plugin `@tanstack/eslint-plugin-query` (rule `exhaustive-deps`) checks it

---

# Key factories

Hand-written keys drift: `['issue', 1]` here, `['issues', 'detail', 1]` there —
and the invalidation silently misses. Write them **once**:

```ts
// src/issues/issueKeys.ts
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filter: IssueFilter) => [...issueKeys.lists(), filter] as const,
  pages: () => [...issueKeys.all, 'page'] as const,
  page: (page: number) => [...issueKeys.pages(), page] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (id: number) => [...issueKeys.details(), id] as const,
};
```

```ts
issueKeys.list('open');      // readonly ['issues', 'list', 'open']
issueKeys.detail(42);        // readonly ['issues', 'detail', 42]

queryClient.invalidateQueries({ queryKey: issueKeys.lists() });  // every list, no detail
queryClient.invalidateQueries({ queryKey: issueKeys.all });      // everything about issues
```

- `as const` keeps the **literal tuple types** — typos become compile errors
- Each level is built from the one above: the **hierarchy is guaranteed**

---

# `queryOptions` — the key and the function, together

```ts
import { queryOptions } from '@tanstack/query-core';   // re-exported by every adapter

export function issuesQuery(filter: IssueFilter) {
  return queryOptions({
    queryKey: issueKeys.list(filter),
    queryFn: () => fetchIssues(filter),
  });
}

export function issueQuery(id: number) {
  return queryOptions({
    queryKey: issueKeys.detail(id),
    queryFn: () => fetchIssue(id),
    staleTime: 60_000,
  });
}
```

- At runtime it **returns its argument** — its value is entirely in the **types**
- No call site can pair a key with the **wrong** function
- The **same object** feeds the adapter's query function, `prefetchQuery`,
  `getQueryData`, `setQueryData`, `invalidateQueries`, the tests…

---

# `queryOptions` types the cache

```ts
const options = issuesQuery('open');

options.queryKey;
// readonly ['issues', 'list', IssueFilter] & { [dataTagSymbol]: IssueSummary[] }

const cached = queryClient.getQueryData(options.queryKey);
//    ^? IssueSummary[] | undefined          ← no generic to write, no cast

queryClient.setQueryData(options.queryKey, (old) => old?.filter((i) => i.id !== 3));
//                                          ^? IssueSummary[] | undefined

queryClient.setQueryData(options.queryKey, 'oops');
//                                         ~~~~~~ Type 'string' is not assignable…
```

- The returned `queryKey` is **tagged** with the data type (`DataTag`): every
  cache method that receives it is typed
- Spread it to add local options:
  `{ ...issuesQuery('open'), select: (issues) => issues.length }` — passed to
  `useQuery` / `injectQuery`
- `infiniteQueryOptions` does the same for infinite queries (chapter 03)
