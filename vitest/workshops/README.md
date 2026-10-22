# Vitest — Workshops (TP)

Hands-on exercises for the **Vitest** training, based on **Vitest 5**,
**Vue 3.5**, **TypeScript 7** and **Node.js 24**.

**One workshop per chapter**, and each one is a **standalone project**: its own
`package.json`, `tsconfig.json`, `.nvmrc` and `README.md`, its own `npm install`,
and not a single import from another workshop.

```bash
cd 02_writing_tests
npm install
npm run test:watch   # the specs, re-run on every save
npm run typecheck
```

## Before the session — check your machine

Run this **about a week before the training**, from this folder:

```bash
node check-env.mjs
```

It has no dependency to install: if it does not even start, Node.js is missing or too
old — and that is already the first thing to fix. It checks Node.js and npm versions,
Git, free disk space, and whether your network lets you reach the npm registry.

```bash
node check-env.mjs --install    # also run `npm install` in every workshop
node check-env.mjs --offline    # skip the network checks
node check-env.mjs --help
```

The `--install` run is the one that matters: doing it at home beats doing it on the
room Wi-Fi. It exits with code `1` if anything is blocking — in that case, **copy
the whole output and send it to your trainer** before the session.

## Toolchain versions

Dependencies were last refreshed on **2026-10-22**, to the latest release of every
package: `vitest` 5.0, `typescript` 7.0, `vue` 3.5, `vite` 8.3,
`@testing-library/vue` 8.1 and `jsdom` 30. Workshop 6 also installs
`typescript` 7, but type checks its `.vue` files with `vue-tsc`, which needs the
JavaScript API that TypeScript 7 no longer ships: `scripts/vue-tsc.mjs` runs it on
TypeScript 6, installed alongside as `typescript6`.

The worked answer to every workshop lives in `solutions/`, one
runnable folder per workshop. Do not hand it out before the exercise.

## Workshops

| Chapter | Folder | Topic | You write |
|---|--------|-------|-------|
| 1 | `01_getting_started/` | Config, first spec, watch / run / UI, coverage | 8 tests |
| 2 | `02_writing_tests/` | `describe`, hooks, `test.each`, assertions | 21 tests |
| 3 | `03_custom_matchers/` | `expect.extend`, `.not`, asymmetric use | 2 matchers |
| 4 | `04_snapshots/` | Inline, file and property-matcher snapshots | 5 tests |
| 5 | `05_mocks/` | `stubGlobal`, `vi.mock`, `__mocks__`, spies, fake timers | 14 tests |
| 6 | `06_vue_testing_library/` | `render`, queries by role, `user-event`, `emitted` | 16 tests |
| 7 | `07_advanced/` | Fixtures, projects, type tests, benchmarks | fixtures, config, type specs |

> In workshops 1 to 6 **you write the tests**: the spec files list them as
> `test.todo`. `npm test` stays red until they run every line and every branch
> of `src/` — the coverage thresholds of the config are the grader. Workshop 7
> ships red specs, like a classic exercise.

Every workshop README opens with **The workshop at a glance** — one row per step,
naming what you do, the file you open and how you know it worked — and ends with a
**Definition of Done**, a checklist of criteria you can verify yourself. Each step
closes on a `→ **Done when**` line. Steps marked *(Bonus)* and the "Going
further" section are deliberately **outside** the DoD.

All seven workshops share one domain — **The Paper Lantern**, a bookshop — but
none of them imports another.

## Node version

Every workshop targets **Node.js >= 22.22.2** (24.15+ recommended, and what
`.nvmrc` pins). Run `nvm use` in the workshop folder to
pick up the version from its `.nvmrc`.
