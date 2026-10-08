---
layout: cover
---

# 00 - Introduction

---

# Learning objectives

At the end of this introduction, you will:

- **Know** the day: the chapters, the six workshops, how they are checked
- **Have** a React app wired to TanStack Query: the package, the
  `QueryClientProvider`, the devtools
- **Know** where each piece of a React Query app lives — the client, the
  provider, the hooks — before chapter 01 fills them in

---
src: ../../tanstack-query-common/slides/00_intro/agenda.md
---

---

# TanStack Query for React

- **TanStack Query** is a framework-agnostic core (`@tanstack/query-core`) and a
  thin adapter per framework. For React: **`@tanstack/react-query`** — the
  library everybody still calls **React Query**
- This training: **TanStack Query 5.104**, **React 19.3**, **Vite 8**,
  **Vitest 5**, **TypeScript 6.0**
- React 18 is supported too; React 19 is what the workshops run

```bash
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools
npm install -D @tanstack/eslint-plugin-query   # optional, recommended
```

- The ESLint plugin catches the classic mistakes: a variable missing from the
  key (`exhaustive-deps`), a client created in a component
  (`stable-query-client`), a spread of the query result (`no-rest-destructuring`)

---

# The client and the provider

```tsx {all|5-6|10-15}
// main.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './queryClient';

// ONCE, at module level — never in a component's body.
const queryClient = createQueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

```ts
// queryClient.ts — a factory: the app calls it once, every test calls it again
export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
}
```

- `QueryClientProvider` puts the client in a **React context**; every hook below
  reads it with `useQueryClient()`
- A client created in a component body is a **new, empty cache at every
  render**. If it must live in a component (SSR), `useState(() => new QueryClient())`

---

# The devtools

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools buttonPosition="top-right" />
</QueryClientProvider>
```

- A **component**, not a browser extension: a floating TanStack logo opens the
  panel — every query, its key, its state, its data, its observers
- Inside the provider: it reads the same client (or pass `client={…}`)
- **Not in the production bundle**: the default export renders nothing unless
  `process.env.NODE_ENV === 'development'` — chapter 06 shows how to load it on
  demand in production
- `buttonPosition`, `position`, `initialIsOpen`, `theme`, `hideDisabledQueries`

---

# Where things live in a React Query app

```text
src/
  main.tsx            createRoot · <QueryClientProvider> · <ReactQueryDevtools>
  queryClient.ts      createQueryClient() — the defaults, in ONE place
  queries/issues.ts   issueKeys · issuesQuery() · useCreateIssue() …
  components/         call the hooks — never the API
  tests/render.tsx    renderApp() — the app in a fresh client, for the specs
```

- **Components never import the API**: they call `useQuery(issuesQuery(filter))`
  or a mutation hook from `queries/`
- `queries/` holds **plain functions** returning options (usable outside React:
  loaders, tests, `prefetchQuery`) and the **hooks** that need React
  (`useMutation` with `useQueryClient`)

---
src: ../../tanstack-query-common/slides/00_intro/workshops.md
---

---

# The workshops, in React

```bash
cd workshops/01_first_queries
npm install
npm run dev          # the app, the Network panel at the bottom, the devtools top right
npm run test:watch   # the shared spec — red on the starter
```

- `src/tests/render.tsx` is the only React-aware file of the specs:

```tsx
export async function renderApp(): Promise<void> {
  cleanup();
  render(
    <QueryClientProvider client={createQueryClient()}>
      <App />
    </QueryClientProvider>,
  );
}
```

- A **fresh** client per test, built with **your** `createQueryClient()`: your
  defaults apply in the specs too
- `src/api/` and `src/tests/shared/` are copies shared with the Angular and Vue
  editions — read them, don't edit them
