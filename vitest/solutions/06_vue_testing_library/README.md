# TP 6 — Vue Testing Library

> This TP is **autonomous**: it does not depend on any other TP. The shop
> front is a small Vue application — a catalog you can search, book cards, a
> cart. It works; its tests ship as `test.todo`, and the test environment is
> not set up yet.

## Goal

Chapter 6 — Test components the way a customer uses them:

- Set up **jsdom**, **jest-dom** and the **cleanup** for Vue Testing Library
- **`render`** a component with props, and read what it **`emitted`**
- Find elements **by role and accessible name** — never by class or test id
- Drive the page with **`user-event`**: click, type, submit
- Test the **whole app** through the screen only

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the shop, to see what you test
npm test             # vitest run --coverage
npm run test:watch   # vitest, in watch mode — keep it open
npm run typecheck    # vue-tsc --noEmit, on TypeScript 6 (scripts/vue-tsc.mjs)
```

Red on the starter: coverage asks for 100 % of `src/` (`main.ts` excepted).

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The test environment | `vite.config.ts`, `tests/setup.ts` | `toBeInTheDocument` compiles and runs |
| 2 | `BookCard` | `tests/BookCard.spec.ts` | Five specs, all by role or text |
| 3 | `CartSummary` | `tests/CartSummary.spec.ts` | Its events carry the right payload |
| 4 | The whole app | `tests/App.spec.ts` | `npm test` exits 0 |

## Steps

### 1. The environment

In `vite.config.ts`: `environment: 'jsdom'` and `setupFiles: ['./tests/setup.ts']`.
In `tests/setup.ts`: `import '@testing-library/jest-dom/vitest'`, and
`afterEach(() => cleanup())` — Testing Library only cleans up by itself when
`globals: true`.

→ **Done when** a first `render(BookCard, { props })` test is green.

### 2. `BookCard`

`screen.getByRole('heading', { name: 'Clean Code' })`, `getByRole('button', { name: /add/i })`.
`render` returns `emitted`: `emitted('add')` is the list of the payloads.
`queryBy…` for what must **not** be there.

### 3. `CartSummary`

`within` is not needed here; `getAllByRole('listitem')` is. For the coupon:
`user.type(screen.getByRole('textbox', { name: 'Coupon' }), '  SAVE10 ')`, then
click **Checkout**.

### 4. The whole app

No prop, no `emitted`: what the customer sees. `within(screen.getByRole('complementary', { name: 'Cart' }))`
scopes the queries to the cart.

→ **Done when** `npm test` exits 0. Stuck on a query? `screen.logTestingPlaygroundURL()`.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — 100 % coverage

**The behaviour is there**

- [ ] No `getByTestId`, no `container.querySelector`
- [ ] Every interaction goes through `user-event`

**You can explain**

- [ ] `getBy` vs `queryBy` vs `findBy`
- [ ] Why a query by role is also an accessibility check

## Going further

- Add a `findBy…` test: make `checkout` async in `App.vue` (a `setTimeout`) and
  wait for the confirmation.
- Run the same specs in a real browser: `@vitest/browser-playwright` and
  `vitest-browser-vue`.
