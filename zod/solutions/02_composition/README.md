# TP 2 — Composing schemas

> This TP is **autonomous**: it does not depend on any other TP. The concert
> schema of TP 1 is given, done. Everything around it — the bodies of the API,
> the payments, the prices, the genres — is yours to derive from it.

## Goal

Chapter 2 — Build a domain out of schemas, without copying a field twice:

- **Derive** schemas with `.omit()`, `.pick()`, `.partial()`, `.extend()` — and
  meet the trap `.partial()` hides
- Model "one of several shapes" with a **discriminated union**, and see what it
  changes in the errors and in the types
- Use an **enum** as the key of a `z.record`, exhaustive or not
- Write a **recursive** schema with a getter

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
npm run typecheck    # tsc --noEmit
```

Four spec files are given and **red**, one per schema file. Keep
`npm run test:watch` open.

**Already done for you**: `src/schemas/concert.ts`, and `CardPaymentSchema` in
`src/schemas/payment.ts` — the model for the two other payment methods.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Derive the bodies of `POST` and of the agenda | `src/schemas/derived.ts` | The `NewConcertSchema` and `ConcertSummarySchema` specs are green |
| 2 | Derive the body of `PATCH` — and fix the trap | `src/schemas/derived.ts` | `ConcertPatchSchema.parse({})` is `{}` |
| 3 | Three payment methods, one discriminated union | `src/schemas/payment.ts` | `tests/payment.spec.ts` is green |
| 4 | Prices for every tier, discounts for some | `src/schemas/pricing.ts` | `tests/pricing.spec.ts` is green |
| 5 | A genre tree, as deep as it goes | `src/schemas/genre.ts` | `npm test` is green |

## Steps

### 1. `POST` and the agenda — `src/schemas/derived.ts`

`NewConcertSchema` is the concert without its `id`; `ConcertSummarySchema` keeps
`id`, `artist` and `startsAt` only. Both are one method call on `ConcertSchema`.

→ **Done when** their specs are green — and adding a field to `ConcertSchema`
would reach both without touching this file.

### 2. `PATCH` — `src/schemas/derived.ts`

1. Write the obvious one-liner: `NewConcertSchema.partial()`.
2. Run the specs. "turns an empty patch into an empty object" is red: read what
   `{}` came out as.
3. `.partial()` makes every field optional, but a field with a `.default()`
   still gets its default when it is missing. Applied to the stored concert, an
   empty patch would **wipe its tags**. Redeclare `tags` and `soldOut` without a
   default, with `.extend()`.

→ **Done when** `ConcertPatchSchema.parse({})` returns `{}`, and a patch still
cannot change the `id`.

### 3. Payments — `src/schemas/payment.ts`

1. Complete `PaypalPaymentSchema` (`email`) and `VoucherPaymentSchema` (`code`,
   exactly 8 characters).
2. Run the specs, and read the issues the plain `z.union` reports for
   `{ method: 'cash' }`: no path, and nothing about `method`.
3. Turn it into `z.discriminatedUnion('method', [...])`: Zod reads `method`
   first, and validates against that one option only.
4. Write `describePayment` as a `switch` on `payment.method`. Hover `payment` in
   each branch: TypeScript narrowed it, `payment.last4` only exists under `card`.

→ **Done when** `tests/payment.spec.ts` is green, and an unknown method is
reported at `['method']`.

### 4. Pricing — `src/schemas/pricing.ts`

`PricesSchema` needs a price for **every** tier: give `z.record` the
`TierSchema` as its key. `DiscountsSchema` needs the same keys, each one
optional: that is `z.partialRecord`.

→ **Done when** `tests/pricing.spec.ts` is green: a missing tier is reported by
its name, and `gold` is rejected by both.

### 5. Genres — `src/schemas/genre.ts`

`subgenres` is a list of `GenreSchema` — inside `GenreSchema` itself. Declare it
as a **getter** (`get subgenres() { return … }`): the reference is only read once
the constant exists, and the type is inferred, recursion included.

→ **Done when** `npm test` is green, and a broken genre three levels down is
reported at its full path.

### 6. *(Bonus)* A branded id

`ConcertId = z.uuid().brand<'ConcertId'>()`. Use it for `id` in
`ConcertSchema`, and write `function cancel(id: ConcertId)`. Can you still call
it with a plain string? With an id that came out of a parse?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the twenty-seven specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] No field of `ConcertSchema` is copied in `derived.ts`
- [ ] An empty patch is `{}` — no default sneaks in
- [ ] An unknown payment method is reported on `method`; a broken card only
      reports the card's fields
- [ ] `describePayment` has no `default` branch, and no cast
- [ ] A missing price tier is named in the error

**You can explain**

- [ ] What `.partial()` does to a field that has a `.default()`
- [ ] What a discriminated union changes in the errors, and in the types
- [ ] The difference between `z.record(TierSchema, …)` and `z.partialRecord(TierSchema, …)`
- [ ] Why the recursive schema needs a getter

## Going further

- Add a fourth method, `{ method: 'applePay', token: string }`, to the union
  only. What does TypeScript say about `describePayment`?
- `TierSchema.exclude(['backstage'])` and `.extract([...])`: write the tiers sold
  online.
- Compare `NewConcertSchema` with `ConcertSchema.extend({ id: z.never() })` and
  with `z.strictObject` + `.omit()`. Which one tells the client it sent an id?
