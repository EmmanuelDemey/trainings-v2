# Advanced Vue.js — Workshops (TP)

Hands-on exercises for the **Advanced Vue.js** training, based on **Vue 3.5**,
**Vite 8**, **Vue Router 5**, **Pinia 4**, **Zod 3**, **VeeValidate 4**,
**Vitest 4** and **Cypress 15**.

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
Git, Docker, free disk space, the ports the training binds (5173 / 4173 for Vite,
8080 / 8081 for the local deployment of workshop 9), and whether your network lets
you reach the npm registry and the Cypress CDN (the two things a corporate proxy
usually blocks).

Docker is reported as a **warning**, never a blocker: it is only used by workshop 9,
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
package. Three deliberate pins, each with a reason that will lift on its own:

| Pin | Why |
|---|---|
| `typescript` **6.0.3**, not 7.x | `vue-tsc@3` patches TypeScript's `lib/tsc`, which TypeScript 7 (the native port) no longer exposes: `npm run typecheck` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. |
| `zod` **3.25**, not 4.x | `@vee-validate/zod@4.15` peers `zod@^3.24`, and no release supports Zod 4. `10_final_project` could take Zod 4 on its own, but teaching two Zod dialects in one training is worse than being one major behind. |
| `webdriverio` **9.x** | Latest; listed here only because Vitest 4 moved the browser provider into `@vitest/browser-webdriverio`, which is now a dependency of workshop 4. |

Two migrations changed workshop code, not just versions:

- **Vitest 4** — `browser.provider` is now a factory imported from its own
  package, not the string `'webdriverio'` (`vitest.browser.config.ts`, and the
  chapter 8 slides).
- **Vite 8 / Rolldown** — `build.rollupOptions.output.manualChunks` only accepts
  the **function** form. The `{ vue: ['vue', 'vue-router'] }` object form every
  article shows now fails with `TypeError: manualChunks is not a function`
  (workshop 9).

The worked answer to every workshop lives in `solutions/vuejs_advanced/`, one
runnable folder per workshop. Do not hand it out before the exercise.

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
| 9 | `09_production/` | Bundle analysis, code-splitting, env config, CI/CD | Netlify or Vercel account (optional) — or Docker for the local plan B |
| 10 | `10_final_project/` — **optional** | Everything above, in one slice — then a cross-review round | A second pair |

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

`10_final_project/` is the **optional** half-day that closes the training. It is
run **in pairs**, and it is the only workshop whose second half is not code: at
the freeze you hand your work to another pair, they run it before they read it,
and each side leaves with three findings written on someone else's code. Its
`README.md` carries the timetable, the review grid and the rules; `REVIEW.md` is
the sheet the reviewers fill in.

## Node version

Every workshop targets **Node.js >= 22.22.2** (24.15+ recommended, and what
`.nvmrc` pins). Run `nvm use` in the workshop folder to
pick up the version from its `.nvmrc`.

## A note on the API

`02_advanced_components/`, `03_composables_directives/`, `05_router/`,
`06_pinia/` and `07_forms/` use an **in-memory fake API**
(`src/api/fakeApi.ts`) with an artificial latency, so nothing has to be installed
or running besides Vite.
`04_testing/` mocks the network explicitly (MSW, `cy.intercept`).
`10_final_project/` uses a fake API too — with `AbortSignal` support on the reads
and a switch, in the app header, that makes every write fail.
