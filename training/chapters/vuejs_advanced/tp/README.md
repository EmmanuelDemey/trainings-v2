# Advanced Vue.js — Workshops (TP)

Hands-on exercises for the **Advanced Vue.js** training, based on **Vue 3.5**,
**Vite 8**, **Vue Router 5**, **Pinia 4**, **Zod 3**, **VeeValidate 4**,
**Vitest 5** and **Cypress 15**.

**One workshop per chapter**, and each one is a **standalone project**: its own
`package.json`, `tsconfig.json`, `.nvmrc` and `README.md`, its own `npm install`,
and not a single import from another workshop. Take them in any order, skip the
ones your group does not need, and nothing breaks.

All code is **TypeScript**, checked with `vue-tsc` (which understands `.vue` files):

```bash
cd 07_advanced_components
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
Git, Docker, free disk space, the ports the training binds (5173 / 4173 for Vite,
8080 / 8081 for the local deployment of workshop 16), and whether your network lets
you reach the npm registry and the Cypress CDN (the two things a corporate proxy
usually blocks).

Docker is reported as a **warning**, never a blocker: it is only used by workshop 16,
whose last step deploys the build to a local nginx or Caddy container when you do not
have a Netlify/Vercel account.

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

## Toolchain versions

Dependencies were last refreshed on **2026-08-20**, to the latest release of every
package. Two deliberate pins, each with a reason that will lift on its own:

| Pin | Why |
|---|---|
| `typescript` **6.0.3**, not 7.x | `vue-tsc@3` patches TypeScript's `lib/tsc`, which TypeScript 7 (the native port) no longer exposes: `npm run typecheck` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. |
| `zod` **3.25**, not 4.x | `@vee-validate/zod@4.15` peers `zod@^3.24`, and no release supports Zod 4. Teaching two Zod dialects in one training would be worse than being one major behind. |

Two migrations changed workshop code, not just versions:

- **Vitest 5** — two defaults flipped: `clearMocks` is **on**, and locators match
  text **exactly**.
- **Vite 8 / Rolldown** — `build.rollupOptions.output.manualChunks` only accepts
  the **function** form. The `{ vue: ['vue', 'vue-router'] }` object form every
  article shows now fails with `TypeError: manualChunks is not a function`
  (workshop 16).

The worked answer to every workshop lives in `solutions/vuejs_advanced/`, one
runnable folder per workshop. Do not hand it out before the exercise.

## Workshops

| Chapter | Folder | Topic | Extra requirements |
|---|--------|-------|--------------------|
| 1 | `01_devtools/` | Timeline, render counters, wasted re-renders, prop identity | The Vue Devtools extension |
| 2 | `02_composables_directives/` | `useFetch`, `useLocalStorage`, `v-lazy-img` directive | — |
| 3 | `03_testing/` | test-utils, queries, stubs, spies, fake timers | — |
| 4 | `04_plugins/` | `createXxx` factory, `InjectionKey`, `useXxx`, global property | — |
| 5 | `05_composables_library/` | `MaybeRefOrGetter`, object of refs, `onScopeDispose` | — |
| 6 | `06_router/` | Transitions, guards, auth flow, scroll behaviour | — |
| 7 | `07_advanced_components/` | Async components, `Suspense`, scoped slots, `v-memo` | — |
| 8 | `08_unplugin/` | File-based routing, auto-imports, auto-components | — |
| 9 | `09_pinia/` | Store splitting, indexes, `shallowRef`, plugins | — |
| 10 | `10_transitions/` | The six classes, `out-in`, `TransitionGroup`, `v-move`, keys | A browser — half of it is checked with your eyes |
| 11 | `11_forms/` | Zod schema, `useZodForm`, VeeValidate, a11y | — |
| 12 | `12_testing_integration/` | Real router, `createTestingPinia`, MSW, Cypress | Cypress downloads a browser |
| 13 | `13_error_handling/` | `<ErrorBoundary>`, `errorHandler`, the `window` net | — |
| 14 | `14_component_architecture/` | The dependency rule as a test, feature-first, slots | — |
| 15 | `15_i18n/` | Messages, plural rules, `n()`, lazy-loaded locales | — |
| 16 | `16_production/` | Bundle analysis, code-splitting, env config, CI/CD | Netlify or Vercel account (optional) — or Docker for the local plan B |

> Each folder is a starter skeleton: implement the `// TODO` markers following the
> steps in its own `README.md`.

`02_composables_directives/` also ships the spec of its first step:
`tests/useFetch.spec.ts` is red on the skeleton, and `npm test` (Vitest) is the
fastest way to know whether your `useFetch` really aborts, really re-runs on a
getter, and really keeps `loading` straight when a request is cancelled.

Every workshop README opens with **The workshop at a glance** — one row per step,
naming what you do, the file you open and how you know it worked — and ends with a
**Definition of Done**, a checklist of criteria you can verify yourself (a command
that exits 0, something observable in the browser, a question you can answer). In
between, each step closes on a `→ **Done when**` line: the exit condition for that
step alone, so you never have to read ahead to know whether you can move on. Steps
marked *(Bonus)* and the "Going further" section are deliberately **outside** the
DoD: it is the floor, not the ceiling.

**`03_testing/` and `12_testing_integration/` are the two workshops where the
LEARNER writes the tests**, so their starters ship specs that already pass plus a
list of `it.todo`s. That also means the CI guard below does not apply to them —
"the starter must fail" is meaningless when the failing tests are the exercise.

`12_testing_integration/` does not build on `03_testing/`: it is a different app,
already unit-tested, that you attack with the router, Pinia, MSW and Cypress.

## Node version

Every workshop targets **Node.js >= 22.22.2** (24.15+ recommended, and what
`.nvmrc` pins). Run `nvm use` in the workshop folder to
pick up the version from its `.nvmrc`.

## A note on the API

`01_devtools/`, `02_composables_directives/`, `05_composables_library/`,
`06_router/`, `07_advanced_components/`, `08_unplugin/`, `09_pinia/`,
`10_transitions/`, `11_forms/` and `14_component_architecture/` use an
**in-memory fake API**
(`src/api/fakeApi.ts`) with an artificial latency, so nothing has to be installed
or running besides Vite.
`03_testing/` and `12_testing_integration/` mock the network explicitly
(MSW, plus `cy.intercept` in `12_testing_integration/`). `04_plugins/`, `13_error_handling/` and `15_i18n/` need no
API at all.
