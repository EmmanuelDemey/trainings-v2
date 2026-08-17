# Advanced Vue.js — Workshops (TP)

Hands-on exercises for the **Advanced Vue.js** training, based on **Vue 3.5**,
**Vite 6**, **Vue Router 4**, **Pinia 3**, **Vitest 3** and **Cypress 14**.

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

## Workshops

| Chapter | Folder | Topic | Extra requirements |
|---|--------|-------|--------------------|
| 2 | `02_advanced_components/` | Async components, `Suspense`, scoped slots, `v-memo` | — |
| 3 | `03_composables_directives/` | `useFetch`, `useLocalStorage`, `v-lazy-img` directive | — |
| 4 | `04_testing/` — **part 1** | test-utils, queries, stubs, spies, fake timers | — |
| 5 | `05_router/` | Transitions, guards, auth flow, scroll behaviour | — |
| 6 | `06_pinia/` | Store splitting, indexes, `shallowRef`, plugins | — |
| 7 | `04_testing/` — **part 2** | Router & Pinia in tests, MSW, Cypress | Cypress downloads a browser |
| 8 | `08_production/` | Bundle analysis, code-splitting, env config, CI/CD | Netlify or Vercel account (optional) |

> Each folder is a starter skeleton: implement the `// TODO` markers following the
> steps in its own `README.md`.

**Chapters 4 and 7 share the same project** (`04_testing/`): part 1 tests
components and composables in isolation, part 2 comes back to it once the router
and Pinia chapters are done. There is no `07_` folder.

## Node version

Every workshop targets **Node.js >= 22**. Run `nvm use` in the workshop folder to
pick up the version from its `.nvmrc`.

## A note on the API

`02_advanced_components/`, `03_composables_directives/`, `05_router/` and
`06_pinia/` use an **in-memory fake API** (`src/api/fakeApi.ts`) with an
artificial latency, so nothing has to be installed or running besides Vite.
`04_testing/` mocks the network explicitly (MSW, `cy.intercept`).
