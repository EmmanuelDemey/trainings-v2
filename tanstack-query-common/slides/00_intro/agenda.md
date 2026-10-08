# The day

| Time | Chapter | Hands-on |
|---|---|---|
| 09:00 | **00** — Introduction | — |
| 09:15 | **01** — Queries and query keys · fetching vs loading | Workshop 01 — First queries (40 min) |
| 10:25 | *break* | |
| 10:40 | **02** — Query configuration | Workshop 02 — Configuration (40 min) |
| 11:50 | **03** — Paginated and infinite queries | Workshop 03 — Pagination & infinite |
| 12:30 | *lunch* | *(workshop 03 is finished after lunch)* |
| 13:50 | **04** — Mutations and callbacks | Workshop 04 — Mutations (35 min) |
| 14:50 | **05** — Optimistic updates and rollbacks | Workshop 05 — Optimistic updates (30 min) |
| 15:40 | *break* | |
| 15:55 | **06** — Debugging with the devtools · testing | Workshop 06 — Testing (35 min) |
| 16:50 | **07** — TanStack Query in a large application | — |
| 17:05 | **08** — Internals and performance · retro | — |

<style>
table { font-size: 0.8em; }
td, th { padding-top: 0.25em !important; padding-bottom: 0.25em !important; }
</style>

---

# Programme

<div style="display: flex; gap: 2em; font-size: 0.9em;">
<div>

### Reading server data

- **Queries and query keys** — the cache, keys, key factories
- **Fetching vs loading** — `status` × `fetchStatus`
- **Query configuration** — `initialData`, `staleTime` vs `gcTime` (ex-`cacheTime`), refetch on focus, retry
- **Infinite & paginated queries**

### Writing server data

- **Mutations & configuration**
- **Callbacks** — `onMutate`, `onSuccess`, `onError`, `onSettled`
- **Optimistic updates & rollbacks**

</div>
<div>

### Shipping it

- **Debugging with the devtools**
- **Testing** with Vitest / Jest, Testing Library and mocks
- **Large applications** — organisation, defaults, prefetching, SSR, offline

### Understanding it

- **Internals** — `QueryClient`, `QueryCache`, `Query`, observers
- **Performance** — what re-renders, what refetches, what stays in memory

</div>
</div>

---

# Objectives of the day

At the end of the day, you will be able to:

- **Explain** why server state needs its own tool, and what TanStack Query
  caches, when, and for how long
- **Read** data with the adapter's query function, **typed key factories** and
  `queryOptions`, and tell **fetching** from **loading**
- **Configure** freshness (`staleTime`), memory (`gcTime`), refetch triggers,
  retries, `enabled`, `select`, `initialData` and `placeholderData`
- **Paginate** without flashes and build an **infinite** feed on a cursor
- **Write** data with mutations, keep every screen in sync with
  **invalidation**, and make it feel instant with **optimistic updates** that
  roll back
- **Debug** with the devtools and **test** components that query
- **Organise** queries in a large codebase, and **reason** about the internals
  to keep it fast

---

# Prerequisites

- **Advanced JavaScript**: promises, `async`/`await`, closures, modules,
  destructuring and spread
- **Web development experience**: HTTP, REST, JSON, the browser devtools
  (Network panel)
- **The basics of your framework**: components, state, a project generated
  with its CLI or Vite
- **TypeScript** reading level: every snippet is typed — you do not need to be
  an expert, generics are explained when they appear
- A **laptop** with **Node.js 24** and a recent Chrome or Firefox

<br />

> This training targets **TanStack Query 5.104**. Where v5 renamed something
> from v4 (`cacheTime` → `gcTime`, `isLoading` → `isPending`,
> `useErrorBoundary` → `throwOnError`…), the slide says so: you will meet v4 code
> in the wild.

---

# How the day runs — and how it is evaluated

<div style="display: flex; gap: 2em;">
<div>

### Teaching methods

- Short **theory** blocks, always code-first, always with the *why*
- **Six hands-on workshops**: about **half the day**
- Live demos on the workshop app, the devtools open
- Field experience from the trainer: what breaks in production
- Digital course materials: slides, workshops, solutions

</div>
<div>

### Evaluation

- **Before** — a self-assessment questionnaire, to calibrate the day
- **During** — the workshops: their given specs go from **red to green**
- **After** — a **final questionnaire** mirroring the self-assessment, to
  measure the progress

</div>
</div>
