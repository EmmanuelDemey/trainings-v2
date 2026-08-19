# Advanced Vue.js — Workshops (TP)

Hands-on exercises for the **Advanced Vue.js** training, based on **Vue 3.5**,
**Vite 6**, **Vue Router 4**, **Pinia 3**, **Zod**, **VeeValidate 4**,
**Vitest 3** and **Cypress 14**.

Each workshop is a **standalone project**: it has its own `package.json`,
`tsconfig.json`, `.nvmrc` and `README.md`, and it **does not depend on any other
workshop**. You can start with any of them in any order.

All code is **TypeScript**, checked with `vue-tsc` (which understands `.vue` files):

```bash
cd 02_advanced_components
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
```

## Before day 1 — check your machine

Run this **about a week before the training**, from this folder:

```bash
node check-env.mjs
```

It has no dependency to install: if it does not even start, Node.js is missing or too
old — and that is already the first thing to fix. It checks Node.js and npm versions,
Git, free disk space, the ports Vite uses (5173 / 4173), and whether your network lets
you reach the npm registry and the Cypress CDN (the two things a corporate proxy
usually blocks).

```bash
node check-env.mjs --install    # also run `npm install` in every workshop
node check-env.mjs --offline    # skip the network checks
node check-env.mjs --help
```

The `--install` run is the one that matters: doing it at home beats doing it on the
room Wi-Fi on day 1. It exits with code `1` if anything is blocking — in that case,
**copy the whole output and send it to your trainer** before the session.

One thing the script cannot check for you: install the **Vue Devtools** browser
extension (Chrome or Firefox). Day 1 opens with a guided tour of it, and every
workshop below assumes the panel is open next to the app.

## Workshops

| Chapter | Folder | Topic | Extra requirements |
|---|--------|-------|--------------------|
| 2 | `02_advanced_components/` | Async components, `Suspense`, scoped slots, `v-memo` | — |
| 3 | `03_composables_directives/` | `useFetch`, `useLocalStorage`, `v-lazy-img` directive | — |
| 4 | `04_testing/` — **part 1** | test-utils, queries, stubs, spies, fake timers | — |
| 5 | `05_router/` | Transitions, guards, auth flow, scroll behaviour | — |
| 6 | `06_pinia/` | Store splitting, indexes, `shallowRef`, plugins | — |
| 7 | `07_forms/` | Zod schema, `useZodForm`, VeeValidate, a11y | — |
| 8 | `04_testing/` — **part 2** | Router & Pinia in tests, MSW, Cypress | Cypress downloads a browser |
| 9 | `09_production/` | Bundle analysis, code-splitting, env config, CI/CD | Netlify or Vercel account (optional) |

> Each folder is a starter skeleton: implement the `// TODO` markers following the
> steps in its own `README.md`.

`03_composables_directives/` also ships the spec of its first step:
`tests/useFetch.spec.ts` is red on the skeleton, and `npm test` (Vitest) is the
fastest way to know whether your `useFetch` really aborts, really re-runs on a
getter, and really keeps `loading` straight when a request is cancelled.

Every workshop README ends with a **Definition of Done** — a checklist of criteria
you can verify yourself (a command that exits 0, something observable in the browser,
a question you can answer). Steps marked *(Bonus)* and the "Going further" section are
deliberately **outside** it: the DoD is the floor, not the ceiling. `04_testing/` has
one DoD per part.

**Chapters 4 and 8 share the same project** (`04_testing/`): part 1 tests
components and composables in isolation, part 2 comes back to it once the router
and Pinia chapters are done. There is no `08_` folder.

## Node version

Every workshop targets **Node.js >= 22**. Run `nvm use` in the workshop folder to
pick up the version from its `.nvmrc`.

## A note on the API

`02_advanced_components/`, `03_composables_directives/`, `05_router/`,
`06_pinia/` and `07_forms/` use an **in-memory fake API**
(`src/api/fakeApi.ts`) with an artificial latency, so nothing has to be installed
or running besides Vite.
`04_testing/` mocks the network explicitly (MSW, `cy.intercept`).
