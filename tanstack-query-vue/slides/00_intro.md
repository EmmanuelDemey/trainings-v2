---
layout: cover
---

# 00 - Introduction

## TanStack Query for Vue

---

# Learning objectives

At the end of this introduction, you will be able to:

- **Find your way** in the day: the chapters, the workshops, the schedule
- **Install** TanStack Query in a Vue 3 app: `@tanstack/vue-query`,
  `VueQueryPlugin`, and the devtools
- **Run** a workshop: its app, its Network panel, its shared spec

---
src: ../../tanstack-query-common/slides/00_intro/agenda.md
---

---

# TanStack Query in a Vue app

```bash
npm install @tanstack/vue-query
npm install -D @tanstack/vue-query-devtools
```

| Package | What |
|---|---|
| `@tanstack/query-core` | the cache, the observers, the timers — **no framework** (installed with the adapter) |
| `@tanstack/vue-query` | the **Vue adapter**: `VueQueryPlugin`, `useQuery`, `useMutation`… — composables over the core |
| `@tanstack/vue-query-devtools` | `<VueQueryDevtools />`: the cache, live, in the page |

<br />

- **Vue 3.3+**; the adapter goes through `vue-demi`, which also supports
  Vue 2.7 — not covered today
- Everything the core does is the same in React and Angular: only the
  composables are Vue's
- **Nuxt**: the same package, installed in a Nuxt plugin — chapter 07

---

# `VueQueryPlugin` — the client, for the whole app

```ts
// src/queryClient.ts
import { QueryClient } from '@tanstack/vue-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  });
}
```

```ts
// src/main.ts
import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { createQueryClient } from './queryClient';

createApp(App).use(VueQueryPlugin, { queryClient: createQueryClient() }).mount('#app');
```

- The plugin **`provide`s** the client; every composable **`inject`s** it —
  Vue's equivalent of React's `<QueryClientProvider>`
- A **function** that builds the client: the app calls it once, every test
  calls it again — a fresh cache per test, with the same defaults

---

# The options of `VueQueryPlugin`

```ts
app.use(VueQueryPlugin, {
  queryClient,                        // your own client…
  // queryClientConfig: { defaultOptions: { … } },   // …or let the plugin build one

  queryClientKey: 'admin',            // several clients: useQueryClient('admin')
  clientPersister: (client) => […],   // restore a persisted cache before mounting
  enableDevtoolsV6Plugin: false,      // the legacy Vue Devtools v6 panel
});
```

| Option | When |
|---|---|
| `queryClient` | almost always — the specs and SSR need to build the client themselves |
| `queryClientConfig` | quick start: the plugin builds the client from it (ignored if `queryClient` is set) |
| `queryClientKey` | two clients in one app (rare: a micro-frontend, an admin area) |
| `clientPersister` | offline / persisted cache (chapter 07); `isRestoring` holds fetches meanwhile |

- Installing the plugin also **mounts** the client: it subscribes to window
  focus and online events — unmounting the app unmounts it

---

# The devtools

```ts
// src/main.ts — next to the app, not inside it
import { createApp, h } from 'vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';

const root = () => [h(App), h(VueQueryDevtools, { buttonPosition: 'top-right' })];
createApp(root).use(VueQueryPlugin, { queryClient: createQueryClient() }).mount('#app');
```

- Or simply `<VueQueryDevtools />` at the end of `App.vue` — in the workshops it
  sits in `main.ts`, because the specs render `App` in jsdom
- **Development only**: in a production build, the package resolves to an
  empty stub — nothing to remove before shipping
- The **Vue Devtools** extension stays useful: it shows the **refs** every
  composable returns, component by component (chapter 06)

---
src: ../../tanstack-query-common/slides/00_intro/workshops.md
---

---

# A workshop, on the Vue side

```bash
cd workshops/01_first_queries
npm install
npm run dev          # http://localhost:5173 — the Network panel at the bottom
npm run test:watch   # the shared spec, red on the starter
npm run typecheck    # vue-tsc --noEmit
```

```ts
// src/tests/render.ts — the ONLY file of the specs that knows Vue (given)
export async function renderApp(): Promise<void> {
  cleanup();
  render(App, {
    global: { plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]] },
  });
}
```

- `src/api/` and `src/tests/shared/` are **copies** of the shared material —
  never edited, the same for React and Angular
- Each workshop is a **Vite 8 + Vue 3.5 + TypeScript** project: `<script setup
  lang="ts">`, checked by `vue-tsc`
- Versions: **TanStack Query 5.104**, Vue 3.5, Vite 8, Vitest 5,
  `@testing-library/vue` 8, TypeScript 6.0, Node.js 24
