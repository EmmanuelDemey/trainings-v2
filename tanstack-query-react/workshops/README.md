# React Query — Workshops

Hands-on exercises for the **React Query** training, based on **TanStack Query
5.104**, **React 19.3**, **Vite 8**, **Vitest 5**, **React Testing Library 16** and
**TypeScript 6.0**.

**One workshop per chapter**, and each one is a **standalone project**: its own
`package.json`, `tsconfig.json`, `.nvmrc` and `README.md`, its own `npm install`,
and not a single import from another workshop. Each starter is the solution of the
previous workshop plus what is new — so you can start any workshop with a clean
slate, even if you did not finish the previous one.

```bash
cd 01_first_queries
npm install
npm run dev          # http://localhost:5173 — the app, and the Network panel at the bottom
npm test             # vitest run — the spec of the workshop, red on the starter
npm run test:watch   # the same, in watch mode: keep it open while you work
npm run typecheck    # tsc --noEmit
npm run build
```

## Before the day — check your machine

- **Node.js 24** (`.nvmrc` pins it; `nvm use` in a workshop folder picks it up).
  Every workshop accepts `^22.22.2 || ^24.15.0 || >=26.0.0`.
- Run `npm install` in **every** workshop folder at home: the room Wi-Fi on the
  day is the worst place to download six `node_modules`.
- A recent **Chrome** or **Firefox**. Nothing to install in the browser: the
  **React Query devtools** are a component of the app (the TanStack logo at the
  top right of the page).

No machine? Every workshop page of the site opens the workshop in an online editor
(StackBlitz): `npm test` and `npm run dev` run there too.

## Toolchain versions

Dependencies were last refreshed on **2026-10-08**, to the latest release of every
package, with one deliberate pin: **TypeScript 6.0** (`~6.0.3`), not 7.x — the
same version as the Angular and Vue editions of this training, whose tooling
(Angular 22, `vue-tsc`) does not accept TypeScript 7 yet.

## How the workshops are checked: the spec and the Network panel

Workshops 01 to 05 come with their spec already written, in
**`src/tests/shared/workshop.spec.ts`**. It is the **same spec for the React,
Angular and Vue** editions of this training: it renders the whole app with
`renderApp()` (`src/tests/render.tsx`, the only file of the tests that knows the
app is React), then reads two things only — what the page shows (by
`data-testid`), and `apiLog`, the list of requests the fake server received.

It is **red on the starter**. Each step of a README tells you which spec turns
green; the workshop is done when `npm test` is.

The **fake API** (`src/api/fakeApi.ts`) is an in-memory issue tracker: 42
issues, an activity feed, every call slow on purpose (400 ms) and written down.
The **Network panel** pinned to the bottom of the page shows what it received,
how many times — a `GET` sent twice shows in red — and has the switches that make
the server misbehave: latency, failing writes, failing the next request, another
user closing an issue. That panel is your instrument: read it before and after
each step.

> **`src/api/` and `src/tests/shared/` are shared copies — do not edit them.**
> They come from `tanstack-query-common/` at the root of the repository and are
> rewritten by `pnpm run sync` (which `pnpm install` at the root of the training
> runs). Your code goes everywhere else.

`06_testing/` is the workshop where **you** write the tests: it has no shared
spec, and its starter is a list of `it.todo`s — green from the start.

Every workshop README opens with **The workshop at a glance** — one row per step,
naming what you do, the file you open and how you know it worked — and ends with a
**Definition of Done**, a checklist of criteria you can verify yourself. Each step
closes on a `→ **Done when**` line: the exit condition for that step alone. Steps
marked *(Bonus)* and the "Going further" section are deliberately **outside** the
DoD: it is the floor, not the ceiling.

The worked answer to every workshop lives in `solutions/`, one runnable folder per
workshop, same names. Do not hand it out before the exercise.

## Workshops

| Chapter | Folder | Topic |
|---|---|---|
| 1 | `01_first_queries/` | `QueryClientProvider`, devtools, `useQuery`, key factory, `queryOptions`, `isPending` vs `isFetching` |
| 2 | `02_query_configuration/` | `staleTime`, `skipToken` / `enabled`, `placeholderData` from the list cache, `refetchOnWindowFocus` |
| 3 | `03_pagination_infinite/` | `keepPreviousData`, `prefetchQuery`, `useInfiniteQuery` on a cursor |
| 4 | `04_mutations/` | `useMutation`, invalidation, the callbacks of `mutate()`, `useIsMutating` |
| 5 | `05_optimistic_updates/` | Optimistic through the cache with rollback, optimistic through the UI |
| 6 | `06_testing/` | `renderWithClient`, `findBy*`, `vi.mock`, `renderHook`, `using` spies |

> Each starter folder is a working app with bugs you can see: implement the
> `// TODO (step N)` markers following the steps of its own `README.md`.
