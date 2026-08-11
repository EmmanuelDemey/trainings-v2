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

| # | Folder | Topic | Extra requirements |
|---|--------|-------|--------------------|
| 2 | `02_advanced_components/` | Async components, `Suspense`, scoped slots, `v-memo` | — |
| 3 | `03_composables_directives/` | `useFetch`, `useLocalStorage`, `v-lazy-img` directive | — |
| 4 | `04_router/` | Transitions, guards, auth flow, scroll behaviour | — |
| 5 | `05_pinia/` | Store splitting, indexes, `shallowRef`, plugins | — |
| 6 | `06_testing/` | test-utils, MSW, `createTestingPinia`, Cypress | Cypress downloads a browser |
| 7 | `07_production/` | Bundle analysis, code-splitting, env config, CI/CD | Netlify or Vercel account (optional) |

> Each folder is a starter skeleton: implement the `// TODO` markers following the
> steps in its own `README.md`.

## Node version

Every workshop targets **Node.js >= 22**. Run `nvm use` in the workshop folder to
pick up the version from its `.nvmrc`.

## A note on the API

Workshops 2 to 5 use an **in-memory fake API** (`src/api/fakeApi.ts`) with an
artificial latency, so nothing has to be installed or running besides Vite.
Workshops 6 and 7 mock the network explicitly (MSW, `cy.intercept`).
