---
layout: cover
---

# 00 - Introduction

---

# Learning objectives

At the end of this introduction, you will be able to:

- **Say** what the day covers, chapter by chapter, and how it is evaluated
- **Name** the versions the training runs on — and why the Angular adapter is
  pinned to an exact one
- **Install** TanStack Query in an Angular application: the package, the
  provider, the devtools
- **Run** a workshop: the app, its Network panel, its specs

---
src: ../../tanstack-query-common/slides/00_intro/agenda.md
---

---

# Tooling and versions

| Tool | Version | Note |
|---|---|---|
| Angular | **22.2** | standalone components, signals, zoneless by default |
| `@tanstack/angular-query-experimental` | **5.104.1**, pinned exactly | the Angular adapter — see next slide |
| `@tanstack/query-core` | 5.104.1 | the engine, shared with React, Vue, Solid, Svelte |
| TypeScript | **6.0** | Angular 22 requires `>=6.0 <6.1` |
| Vitest | 5.0 | run by `ng test` — the `@angular/build:unit-test` builder |
| Testing Library | dom 10, angular 19.5, user-event 14 | |
| Node.js | 24 | `.nvmrc` in every workshop |

<br />

- One **Angular CLI project per workshop**: `npm install`, `npm run dev`, `npm test`
- No backend: an in-memory fake API, in the browser and in the tests

---

# "experimental" — what it means

```bash
npm install --save-exact @tanstack/angular-query-experimental
```

- The **engine** (`query-core`) is the same stable code as React Query's: caching,
  retries, invalidation, optimistic updates behave identically
- The **adapter** — the `inject*` functions, the providers — is labelled
  experimental: *breaking changes may land in minor **and patch** releases*
- So: **pin the exact version** (`"5.104.1"`, no `^`), read the changelog before
  each upgrade, and upgrade on purpose — the workshops do exactly that
- In practice the API has been steady across 5.x — but `injectQueries` still sits
  behind an extra door: `@tanstack/angular-query-experimental/inject-queries-experimental`
- Two names are already **deprecated**: `provideAngularQuery` (use
  `provideTanStackQuery`) and `injectQueryClient()` (use `inject(QueryClient)`)

---

# Setup — one provider

```ts
// src/queryClient.ts — the app AND the tests build their client here
import { QueryClient } from '@tanstack/angular-query-experimental';

export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
}
```

```ts
// src/app/app.config.ts
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { withDevtools } from '@tanstack/angular-query-experimental/devtools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideTanStackQuery(createQueryClient(), withDevtools()),
  ],
};
```

- One client per application, in the **root** injector: every `injectQuery`
  below reads and writes the same cache
- `QueryClient` is itself the DI token: `inject(QueryClient)` anywhere
- `withDevtools()` mounts the floating panel — in **development builds only**

---

# Before the first workshop

```bash
cd workshops/01_first_queries
nvm use              # Node.js 24, from .nvmrc
npm install
npm run dev          # ng serve — http://localhost:4200
npm test             # ng test --watch=false — the shared specs, red on the starter
npm run typecheck    # ngc (templates included) + tsc for the specs
```

- `npm test` runs **Vitest through the Angular CLI** (`@angular/build:unit-test`):
  no `vitest.config.ts`, no Karma, jsdom by default
- Every `src/**/*.spec.ts` is picked up — the given spec lives in
  `src/tests/shared/workshop.spec.ts`
- `src/tests/render.ts` is the only file the specs need from Angular: it renders
  the root component with `@testing-library/angular`, inside a fresh client

---
src: ../../tanstack-query-common/slides/00_intro/workshops.md
---
