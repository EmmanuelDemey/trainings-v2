# TP 2 — Writing tests

> This TP is **autonomous**: it does not depend on any other TP. The cart of
> the bookshop is written and correct; its tests are not. Every spec file ships
> as a list of `test.todo`, with the name of each test to write.

## Goal

Chapter 2 — Tests that read like a specification:

- Group with **`describe`**, nest them, and share setup with **`beforeEach`**
- Cover many cases at once with **`test.each`**
- Pick the right assertion: **`toBe`**, **`toEqual`**, **`toThrow`**, **`toHaveLength`**
- Keep track of what is left with **`test.todo`** and **`test.skip`**
- Use **coverage** to find the branch no test reaches

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --coverage
npm run test:watch   # vitest, in watch mode — keep it open
npm run typecheck    # tsc --noEmit
```

`npm test` is red on the starter: the todos run nothing, and the coverage
thresholds ask for **100 %** of `src/`. It turns green when your tests run every
line and every branch.

**Already done for you:** `src/catalog.ts` (four books, a fresh copy on every
call), `src/coupon.ts` (three coupons, documented on top of the file) and
`src/cart.ts`. Read them first: the comments are the specification.

## The workshop at a glance

| # | What you write | Where | Done when |
|---|---|---|---|
| 1 | Read the code under test | `src/*.ts` | You can say what each coupon does |
| 2 | The coupons, with `test.each` | `src/coupon.spec.ts` | `coupon.ts` is 100 % covered |
| 3 | A fresh cart for each test | `src/cart.spec.ts` | `beforeEach` builds it, no test shares state |
| 4 | `add` and `remove` | `src/cart.spec.ts` | Their todos are green |
| 5 | The totals | `src/cart.spec.ts` | `npm test` exits 0 |

## Steps

### 1. Read the code under test

Note the edge cases the comments promise: `SAVE10` rounds **down**, `HALF`
needs €40.00, `FIVEOFF` never goes below zero, the code is case-insensitive.

→ **Done when** you can predict `applyCoupon(999, 'SAVE10')`.

### 2. The coupons — `src/coupon.spec.ts`

One `test.each` over objects `{ code, total, expected }`: its name can print
them with `$code`, `$total`, `$expected`. Then one test per error.

→ **Done when** `coupon.ts` shows 100 % in the coverage table.

### 3. A fresh cart — `src/cart.spec.ts`

Declare `let cart: Cart` and the books at the top of the `describe`, assign
them in a `beforeEach`. `createCatalog()` returns new objects every time: a
test may change them.

→ **Done when** "starts empty" is green.

### 4. `add` and `remove`

`toEqual` compares the lines **by value**; `toBe` would compare references.
For the refused quantities, `test.each([0, -1, 1.5])` and `toThrow(RangeError)`.

→ **Done when** the `add` todos and the `remove` one are green.

### 5. The totals

A nested `describe('totals')` with its own `beforeEach` that fills the cart:
it runs **after** the outer one.

→ **Done when** `npm test` exits 0. The last todo is left on purpose *(Bonus)*:
decide whether the cart keeps the order of the books, and turn it into a real
test.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — 100 % coverage

**The behaviour is there**

- [ ] No test depends on another one: `npx vitest run --sequence.shuffle` stays green
- [ ] Each error case asserts the message or the error class

**You can explain**

- [ ] `toBe` vs `toEqual` vs `toStrictEqual`
- [ ] In which order the `beforeEach` of nested `describe`s run
- [ ] Why `test.only` makes CI fail

## Going further

- Turn `applyCoupon`'s table into `test.for` — what changes in the callback?
- Add `{ retry: 2 }` to a test: when would that hide a real bug?
- Lower one threshold to 90 % and delete a test: which line does coverage name?
