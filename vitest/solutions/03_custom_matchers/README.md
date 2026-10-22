# TP 3 — Custom matchers

> This TP is **autonomous**: it does not depend on any other TP. The till of
> the bookshop builds receipts; the specs that check it want two matchers
> Vitest does not have. Their specs and their types are given: the matchers are
> yours to write.

## Goal

Chapter 3 — Make `expect` speak your domain:

- Write a matcher: a function returning **`{ pass, message }`**
- Honour **`.not`** with **`this.isNot`**, and print values with **`this.utils`**
- Register it for every spec with **`expect.extend`** in a **setup file**
- Use it as an **asymmetric matcher**, inside `toEqual`
- Read the **`Matchers<R, T>`** declaration that types it

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run
npm run test:watch   # vitest, in watch mode — keep it open
npm run typecheck    # tsc --noEmit
```

`tests/matchers.spec.ts` (the matchers themselves) and `tests/receipt.spec.ts`
(the receipt, checked with them) are given and **red**.

**Already done for you:** `src/isbn.ts`, `src/receipt.ts`, and
`tests/vitest.d.ts` — the declaration that lets `expect(x).toBeValidIsbn()`
compile.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `toBeValidIsbn` | `tests/matchers.ts` | It passes, fails, and fails under `.not` with the right message |
| 2 | `toTotal` | `tests/matchers.ts` | Its four specs are right |
| 3 | Register them | `tests/setup.ts`, `vitest.config.ts` | `npm test` exits 0 |

## Steps

### 1. `toBeValidIsbn` — `tests/matchers.ts`

`pass` when `received` is a string and `isValidIsbn` says yes. The message is
read when the assertion **fails**: under `.not`, that is when `pass` was true —
`this.isNot` tells you which wording to use. Print the value with
`this.utils.printReceived(received)`.

→ **Done when** you can predict the two messages the specs expect.

### 2. `toTotal`

Two ways to fail: a total that is not `expected`, and a receipt whose
`totalInCents` disagrees with its lines. The second one is a broken receipt,
never a right one: return `pass: this.isNot` so that it fails under `.not` too.

→ **Done when** you can say why `pass: this.isNot` makes it fail both ways.

### 3. Register them — `tests/setup.ts`

`expect.extend({ toBeValidIsbn, toTotal })` in `tests/setup.ts`, and that file
in `setupFiles` of `vitest.config.ts`.

→ **Done when** `npm test` exits 0, including "works as an asymmetric matcher".

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the eighteen specs

**The behaviour is there**

- [ ] Each message says what was expected **and** what was received
- [ ] `expect.toBeValidIsbn()` works inside `toEqual`, with no extra code

**You can explain**

- [ ] What `R` and `T` are in `Matchers<R, T>`
- [ ] Why the matchers are registered in a setup file and not in each spec

## Going further

- Add `actual` and `expected` to the result of `toTotal`: what changes in the
  failure output?
- Write `toBeInStock()` for a `{ stock: number }`, and use it as
  `expect.toBeInStock()` in an `arrayContaining`.
- `@testing-library/jest-dom` is a library of matchers: open its
  `vitest.d.ts` — same declaration.
