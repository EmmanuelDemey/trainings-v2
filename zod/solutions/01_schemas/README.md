# TP 1 — Schemas & types

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the specs of a concert payload, as a ticketing API sends it. The schema that
> checks it, and the two functions that use it, are yours to write.

## Goal

Chapter 1 — Stop trusting what comes over the wire:

- Describe a payload with **`z.object`**, the **string formats** (`z.uuid()`,
  `z.iso.datetime()`, `z.url()`) and the number checks
- Fill in the missing fields with **`.default()`**, and see why the **input** and
  **output** types of a schema differ
- Choose between **`parse`** (it throws) and **`safeParse`** (it reports)
- Read a **`ZodError`**: one issue per broken rule, each with its **`path`**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
npm run typecheck    # tsc --noEmit
```

`tests/schemas.spec.ts` and `tests/parse.spec.ts` are given and **red**: they
drive the schema the way the app does — with a payload — never through its
internals. Keep `npm run test:watch` open.

`tests/fixtures.ts` holds the concert the API sends: read it first. It lacks
`tags` and `soldOut`, and carries a key the app knows nothing about.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The venue schema | `src/schemas/concert.ts` | The `VenueSchema` specs are green |
| 2 | The concert schema, with its formats and defaults | `src/schemas/concert.ts` | The `ConcertSchema` specs are green, and you can say what `ConcertInput` and `Concert` differ by |
| 3 | `parseConcert` — the strict entry point | `src/parse.ts` | The `parseConcert` specs are green |
| 4 | `partitionConcerts` — a feed with broken entries | `src/parse.ts` | `npm test` is green |

## Steps

### 1. The venue — `src/schemas/concert.ts`

`name` and `city` are non-empty strings; `capacity` counts people. A string of
length 0 is still a string, and `12.5` is still a number: say what you mean
with `.min(1)`, `.int()` and `.positive()`.

→ **Done when** the three `VenueSchema` specs are green.

### 2. The concert — `src/schemas/concert.ts`

1. Write the fields listed in TODO 2. The formats are **top-level** in Zod 4:
   `z.uuid()`, `z.url()`, and `z.iso.datetime()` — the last one refuses a date
   with no time, which is exactly what the spec checks.
2. `tags` and `soldOut` are missing from the fixture: give them a `.default()`.
3. Hover `ConcertInput` and `Concert` in your editor. `tags` is optional on one
   side and required on the other — the defaults only exist **after** the parse.

> The fixture's `internalScore` comes out of the parse gone. `z.object` strips
> the keys it does not know: that is what keeps a leaked internal field out of
> your app.

→ **Done when** the `ConcertSchema` specs are green, including "reports every
broken field at once": Zod does not stop at the first error.

### 3. `parseConcert` — `src/parse.ts`

One concert from the API. If it does not match, the bug is on the other side of
the wire: `.parse()`, and let the `ZodError` fly.

→ **Done when** the `parseConcert` specs are green, and the return type comes
from the schema — no cast, no hand-written interface.

### 4. `partitionConcerts` — `src/parse.ts`

A partner feed of a hundred concerts with one broken entry: throwing would hide
the ninety-nine others. Use `.safeParse()`, keep the valid entries, and report
the index and the issues of each rejected one.

→ **Done when** `npm test` is green, and `partitionConcerts` contains no
`try` / `catch`.

### 5. *(Bonus)* Strict on the admin side

The back-office posts concerts too, and there a key the schema does not know is a
**typo** worth an error, not something to strip silently. Write
`AdminConcertSchema` with `z.strictObject` (same fields) and check what
`{ ...concert, prcie: 10 }` reports.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the eighteen specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] A date without a time, a negative price, a non-UUID id are rejected
- [ ] A broken venue capacity is reported at `['venue', 'capacity']`
- [ ] Missing `tags` and `soldOut` come out as `[]` and `false`
- [ ] Unknown keys never reach the app
- [ ] `partitionConcerts` never throws, and says which entries it dropped and why

**You can explain**

- [ ] Why TypeScript alone cannot check the payload of a `fetch`
- [ ] What `z.input` and `z.output` differ by in this schema, and why
- [ ] When you reach for `parse`, and when for `safeParse`
- [ ] What `z.object` does with a key it does not know — and the two other behaviours you can ask for

## Going further

- Replace `z.iso.datetime()` with `z.iso.datetime({ offset: true })` and feed it
  `2026-11-14T20:30:00+01:00`. Which one does your API really send?
- `z.url()` accepts `ftp://` and `javascript:`. Restrict `website` to `https`
  with its `protocol` option.
- Write `const Concerts = z.array(ConcertSchema)` and parse the feed of step 4
  with it. What does one broken entry do to the whole list?
