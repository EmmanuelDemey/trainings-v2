# TP 2 — Everyday types

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the cart of a small online shop: the functions run, but their types are too
> loose to catch anything. Tighten them, then write the code.

## Goal

Chapter 2 — The types you write every day:

- Describe an object with an **`interface`**: **`readonly`** and **optional**
  properties
- Derive a **union** from a list with **`as const`**, and check an object
  against a type with **`satisfies`** — without losing its own type
- Use a **tuple** and **rest parameters**
- Give a parameter a **default value**, and take **`unknown`** input safely
- Write a function with **overloads**
- Release a resource with **`using`** and `Symbol.dispose`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --typecheck
npm run test:watch   # the same, in watch mode
npm run typecheck    # tsc --noEmit
```

Two kinds of specs are given, both **red**:

- `tests/cart.spec.ts` runs the code, as any test does
- `tests/types.test-d.ts` is **never run**: `expectTypeOf` asks the compiler
  what type an expression has. A wrong type is a failing spec.

`tests/fixtures.ts` holds a small catalog: read it first. Keep
`npm run test:watch` open.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `Product`: `readonly` and optional | `src/cart.ts` | The `Product` type spec is green |
| 2 | `Currency` from `as const`, `SHIPPING` with `satisfies` | `src/cart.ts` | The `Currency`, `SHIPPING` and `shippingFor` specs are green |
| 3 | `CartLine` as a tuple, `lineTotal`, `cartTotal` | `src/cart.ts` | The `CartLine`, `lineTotal` and `cartTotal` specs are green |
| 4 | `formatPrice` with a default, `parseQuantity` from `unknown` | `src/cart.ts` | The `formatPrice` and `parseQuantity` specs are green |
| 5 | `findProduct` with overloads | `src/cart.ts` | The `findProduct` specs — runtime and type — are green |
| 6 | `reserveStock` with `Symbol.dispose` | `src/cart.ts` | `npm test` and `npm run typecheck` are green |

## Steps

### 1. The product — `src/cart.ts`

`id` and `tags` never change once the product exists. Mark the property, **and**
the array: what is the difference between `readonly tags: string[]` and
`tags: readonly string[]`? The spec asks for the second one — why?

→ **Done when** the `Product` type spec is green.

### 2. Currencies and shipping — `src/cart.ts`

1. Hover over `CURRENCIES`: `string[]`. Add `as const`, hover again. Derive
   `Currency` from it with `(typeof CURRENCIES)[number]` — one list, never written twice.
2. `SHIPPING` is annotated `Record<string, number>`: `SHIPPING.JPY` compiles,
   and nothing says `GBP` must be there. Replace the annotation with **`satisfies Record<Currency, number>`**,
   then remove `GBP` from the object: what does the checker say?
3. Write `shippingFor`.

→ **Done when** the `Currency`, `SHIPPING` and `shippingFor` specs are green.

### 3. The cart — `src/cart.ts`

`(Product | number)[]` lets `[3, milk, milk]` through. Make `CartLine` a **tuple**
with **labels**: `[product: Product, quantity: number]`. Then destructure it in
`lineTotal`'s signature, and apply the discount — `discount ?? 0` when there is
none. Round to the cent.

`cartTotal` takes **any number** of lines: what type does `lines` have inside the function?

→ **Done when** the `CartLine`, `lineTotal` and `cartTotal` specs are green.

### 4. Prices and quantities — `src/cart.ts`

1. `formatPrice`: replace the optional parameter with a **default value**. Does
   `currency` still need `?` in the signature? Write the three formats with a
   `switch` — what does the checker say about a missing `return` once all three
   cases are covered?
2. `parseQuantity` receives `unknown` — from a form, a query string. Unlike `any`,
   `unknown` lets you do **nothing** until you have checked it: narrow with
   `typeof` until you hold a positive integer, and throw `Invalid quantity: …`
   otherwise.

→ **Done when** the `formatPrice` and `parseQuantity` specs are green.

### 5. Overloads — `src/cart.ts`

`findProduct` returns `any`: the caller learns nothing. Write **two overload
signatures** — a `string` gives `Product | undefined`, a `readonly string[]`
gives `Product[]` — above the implementation. The implementation signature is
not visible to callers: what does `findProduct(catalog, 42)` report?

→ **Done when** the `findProduct` specs — the three runtime ones and the two
type ones — are green.

### 6. `using` — `src/cart.ts`

`reserveStock` logs `reserved <id>`, and returns an object whose
`[Symbol.dispose]()` logs `released <id>`. Read the spec: where does
`using` call it?

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 7. *(Bonus)* — an async release

Write `reserveStockAsync`, which returns an `AsyncDisposable` — its
`[Symbol.asyncDispose]()` returns a `Promise`. How do you declare the variable
that holds it?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the twenty-seven specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `Currency` is derived from `CURRENCIES`, never written by hand
- [ ] Removing a currency from `SHIPPING` is a compile error
- [ ] `[3, milk]` is not a `CartLine`
- [ ] No `any` left in `src/cart.ts`

**You can explain**

- [ ] What `as const` changes in the type of an array literal
- [ ] What `satisfies` checks, and what an annotation would have lost
- [ ] Why `unknown` is safer than `any` for input you do not control
- [ ] Why the implementation signature of an overloaded function is not callable

## Going further

- Replace `interface Product` with `type Product = { … }`. Does any spec
  change? Then try to declare `interface Product` **twice**: what happens, and
  where is that useful?
- `const CURRENCIES = ['EUR', 'USD', 'GBP'] as const satisfies readonly string[]`:
  what does each part do?
- Without `using`, write the `try` / `finally` that `reserveStock`'s spec would
  need. Which one would you rather review?
