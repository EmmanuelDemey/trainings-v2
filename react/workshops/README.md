# React — Workshops (TP)

Hands-on exercises for the **React** training, based on **React 19.3**, **Vite 8**,
**TypeScript 7**, **Vitest 5** with **Testing Library**, **React Router 8**,
**TanStack Query 5**, **React Hook Form 7** with **Zod 4**, **Material UI 9**,
**Zustand 5**, **Storybook 10**, **MSW 3** and **Cypress 16**.

**One workshop per chapter**, and each one is a **standalone project**: its own
`package.json`, `tsconfig.json`, `.nvmrc` and `README.md`, its own `npm install`,
and not a single import from another workshop. Take them in any order, skip the
ones your group does not need, and nothing breaks.

All code is **TypeScript**, function components only, checked with `tsc`:

```bash
cd 08_hooks
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
```

## Before day 1 — check your machine

Run this **about a week before the training**, from this folder:

```bash
node check-env.mjs
```

It has no dependency to install: if it does not even start, Node.js is missing or too
old — and that is already the first thing to fix. It checks Node.js and npm versions,
Git, Docker, free disk space, the ports the training binds (5173 / 4173 for Vite,
6006 for Storybook in workshop 20, 8080 for the container of workshop 22), and
whether your network lets you reach the npm registry and the Cypress CDN (the two
things a corporate proxy usually blocks).

Docker is reported as a **warning**, never a blocker: it is only used by workshop 22,
which builds the app's image and runs it locally.

```bash
node check-env.mjs --install    # also run `npm install` in every workshop
node check-env.mjs --offline    # skip the network checks
node check-env.mjs --help
```

The `--install` run is the one that matters: doing it at home beats doing it on the
room Wi-Fi on day 1. It exits with code `1` if anything is blocking — in that case,
**copy the whole output and send it to your trainer** before the session.

One thing the script cannot check for you: install the **React Developer Tools**
browser extension (Chrome, Edge or Firefox). Chapter 1 gives a tour of it, and its
Components and Profiler panels come back in most workshops.

## Toolchain versions

Dependencies were last refreshed on **2026-10-18**, to the latest release of every
package, with no deliberate pin: every workshop runs **TypeScript 7**. Workshop 1
lints and formats with **oxlint** and **oxfmt** rather than ESLint and Prettier —
`typescript-eslint` does not support TypeScript 7 yet, Oxc has no such dependency.

Two migrations changed workshop code, not just versions:

- **Vitest 5** — `clearMocks` is **on** by default, and spies are
  `Disposable`: the specs write `using spy = vi.spyOn(…)` and never call
  `mockRestore()` themselves.
- **React 19** — `ref` is a plain prop (no more `forwardRef`), forms take an
  `action`, and `use()` reads a promise inside `Suspense`.

The worked answer to every workshop lives in `solutions/`, one
runnable folder per workshop. Do not hand it out before the exercise.

## Workshops

| Chapter | Folder | Topic | Extra requirements |
|---|--------|-------|--------------------|
| 1 | `01_getting_started/` | A Vite project, a first component, oxlint + oxfmt | The React Developer Tools extension |
| 2 | `02_typescript/` | `Person` model, discriminated union `RemoteData<T>`, type guard, generics, utility types | — |
| 3 | `03_unit_testing/` | **You write the tests**: Vitest, Testing Library, user-event, fake timers, `using` spies, snapshot | — |
| 4 | `04_ecmascript/` | Destructuring, spread, `??`, `?.`, `Object.groupBy`, `toSorted`, `structuredClone`, `Promise.allSettled` | — |
| 5 | `05_jsx/` | A people table: lists and `key`, fragments, conditional rendering, interpolation | — |
| 6 | `06_components/` | `Title`, `Input` with `ComponentProps<'input'>`, controlled `PeopleFilter`, `Card` with `children`, lifted state | — |
| 7 | `07_styling/` | CSS Modules, a Sass module, a theme with CSS custom properties | — |
| 8 | `08_hooks/` | `useState`, `useReducer` navigation, `useEffect` with cleanup, `useRef`, `useMemo` | — |
| 9 | `09_data_fetching/` | Loading / error states, `AbortController` against races, `VITE_API_BASE_URL` | — |
| 10 | `10_error_boundaries/` | A class `ErrorBoundary` with `fallback` and `resetKeys`, what it does not catch | — |
| 11 | `11_custom_hooks/` | `useFetch`, `useDebouncedValue`, `useLocalStorage`, tested with `renderHook` | — |
| 12 | `12_state_management/` | `FavoritesContext` with `useReducer`, split contexts, no more prop drilling | — |
| 13 | `13_lazy_suspense/` | `React.lazy`, `Suspense`, `use()` on a cached promise, `useTransition` | — |
| 14 | `14_router/` | React Router data mode: layout + `Outlet`, `NavLink`, loaders, search params, error route | — |
| 15 | `15_i18n/` | i18next + react-i18next, plurals, `Intl` number / date / relative time, typed keys | — |
| 16 | `16_forms/` | React 19 form actions, `useActionState`, `useFormStatus`, React Hook Form + Zod, accessible errors | — |
| 17 | `17_tanstack_query/` | `useQuery`, a query-key factory, `useMutation`, invalidation | — |
| 18 | `18_ui_library/` | Material UI: `ThemeProvider`, light / dark theme, `Table`, `styled` and `sx` | — |
| 19 | `19_zustand/` | A store with selectors, the `persist` middleware, testing a store | — |
| 20 | `20_storybook/` | Stories in CSF3, args and controls, portable stories in Vitest | Port 6006 free |
| 21 | `21_e2e/` | Cypress against the dev server: specs, `cy.intercept`, a custom command | Cypress downloads a browser |
| 22 | `22_docker/` | Runtime `env.js`, multi-stage non-root image, nginx SPA fallback, Kubernetes, GitHub Actions | Docker; `kubectl` + a local cluster are optional |
| 23 | `23_react_doctor/` | Scan with React Doctor, fix derived state, effect chains, `key` resets, index keys | Network for `npx react-doctor@latest` |

> Each folder is a starter: implement the `// TODO` markers following the steps in
> its own `README.md`.

Every workshop ships its specs, next to the code they grade (`*.spec.ts(x)`): they
are red on the starter, and `npm run test:watch` in a second terminal is the fastest
way to know whether a step is done. They test **behaviour** — what a user sees and
does — so any correct implementation turns them green, not only the one in
`solutions/`.

Every workshop README opens with **The workshop at a glance** — one row per step,
naming what you do, the file you open and how you know it worked — and ends with a
**Definition of Done**, a checklist of criteria you can verify yourself (a command
that exits 0, something observable in the browser, a question you can answer). In
between, each step closes on a `→ **Done when**` line: the exit condition for that
step alone, so you never have to read ahead to know whether you can move on. Steps
marked *(Bonus)* and the "Going further" section are deliberately **outside** the
DoD: it is the floor, not the ceiling.

**`03_unit_testing/` is the workshop where the LEARNER writes the tests**, so its
starter is green from the start: its spec files ship `it.todo`s describing what to
test. That is also why the CI guard (`scripts/check-workshops.mjs`, at the root of
the repository) checks it the other way round — "the starter must fail" is
meaningless when writing the failing tests is the exercise. **`21_e2e/`** is graded
by Cypress against a running dev server, which the CI does not start: only its unit
specs run there.

## Node version

Every workshop targets **Node.js >= 22.22.2** (24.15+ recommended, and what
`.nvmrc` pins). Run `nvm use` in the workshop folder to
pick up the version from its `.nvmrc`.

## A note on the API

`09_data_fetching/`, `11_custom_hooks/`, `13_lazy_suspense/`, `14_router/`,
`16_forms/` and `17_tanstack_query/` talk to an HTTP API mocked with **MSW**: the
same handlers (`src/mocks/handlers.ts`, over the in-memory Star Wars people) serve
the specs through `setupServer` and the browser through a service worker started in
`src/main.tsx`, so `npm run dev` works offline. In the browser they add a small
artificial delay, so loading states are visible. `21_e2e/` stubs the network with
`cy.intercept`. Every other workshop needs no API at all: its data is a local
`src/data/people.ts`.
