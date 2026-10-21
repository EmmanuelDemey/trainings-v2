# TP 4 — Unions & narrowing

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the attachments of a blog post — an image, a video or a sound — and the state
> of their upload, both described by a single "bag of optional fields". Split
> them into unions the checker can reason about, then write the code that
> narrows them.

## Goal

Chapter 4 — Unions & narrowing:

- Replace a type full of optional fields with a **discriminated union** of
  **literal types**
- **Narrow** a union with `switch`, `typeof`, `in` and equality
- Make a forgotten case a **compile error**, with `never`
- Write a **type guard** (`value is T`) and an **assertion function**
  (`asserts condition`)
- Turn `unknown` JSON into a typed value, one check at a time
- Model a state machine where **impossible states cannot be written**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --typecheck
npm run test:watch   # the same, in watch mode
npm run typecheck    # tsc --noEmit
```

`tests/*.spec.ts` run the code, `tests/types.test-d.ts` is checked by the
compiler: all are given and **red**. `tests/fixtures.ts` holds one attachment of
each kind — read it first. Keep `npm run test:watch` open.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `Image`, `Video`, `Audio`, and their union | `src/attachments.ts` | The `Attachment` type specs are green |
| 2 | `assertNever`, `render` | `src/attachments.ts` | The `render` specs are green |
| 3 | `isPlayable` as a type guard, durations | `src/attachments.ts` | The `isPlayable`, `totalDuration` and `formatDuration` specs are green |
| 4 | `assert`, `parseAttachment` | `src/parse.ts` | The `assert` and `parseAttachment` specs are green |
| 5 | `Upload` as a discriminated union | `src/upload.ts` | The `Upload` type specs are green |
| 6 | `next`, `describe` | `src/upload.ts` | `npm test` and `npm run typecheck` are green |

## Steps

### 1. Three kinds of attachment — `src/attachments.ts`

`Attachment` has every field optional: an image without `altText` compiles, a
sound with a `width` too. Write `Image`, `Video` and `Audio` — each with its
own **literal** `kind` and only the fields it needs, all required — and make
`Attachment` their union. Then derive `AttachmentKind` from it with an indexed
access: `Attachment['kind']`.

→ **Done when** the two `Attachment` type specs are green — and `npm run
typecheck` flags the code that now reads a field some kinds do not have.

### 2. Rendering, exhaustively — `src/attachments.ts`

1. `assertNever` takes `unknown`: turn it into `never`. Only a value that can
   be **nothing** may be passed to it.
2. Write `render` with a `switch` on `attachment.kind`. Hover over `attachment`
   in each `case`: what is its type? End with `default: return
   assertNever(attachment)`.
3. Add `| Gif` to the union with `kind: 'gif'`. Where does the build break? Remove it.

→ **Done when** the three `render` specs are green.

### 3. What plays — `src/attachments.ts`

1. `isPlayable` returns a `boolean`: `filter(isPlayable)` still gives
   `Attachment[]`, and `attachment.duration` does not compile. Make it a **type
   guard** — `attachment is Video | Audio` — and check with the `in` operator.
2. `totalDuration` filters, then sums. No cast needed.
3. `formatDuration`: `padStart` is your friend.

→ **Done when** the `isPlayable`, `totalDuration` and `formatDuration` specs are green.

### 4. Parsing `unknown` — `src/parse.ts`

1. `assert` returns `void`: after `assert(typeof url === 'string', …)` the
   checker still thinks `url` is `unknown`. Change its return type to
   **`asserts condition`**.
2. Write `parseAttachment`. First check `input` is a non-null object, not an
   array — a type guard `isRecord(value): value is Record<string, unknown>`
   helps. Then check `url`, then branch on `kind` and check what that kind needs.
   **Build** the attachment from the checked fields: a sound must not keep the
   `altText` it was sent with. A missing `autoplay` means `false`.

→ **Done when** the `assert` type spec and the eleven `parseAttachment` specs are green.

### 5. The states of an upload — `src/upload.ts`

`{ status: 'done', progress: 1 }` compiles, and so does `{ status: 'failed' }`
without an error. Rewrite `Upload` as a **union of four object types**, one per
`status`, each with its own fields — the same move as step 1, on a state.

→ **Done when** the two `Upload` type specs are green.

### 6. The state machine — `src/upload.ts`

1. `next` switches on `event.type`, then checks `upload.status`. An event that
   makes no sense in the current state returns `upload` itself — the same
   object. End with `assertNever(event)`.
2. `describe` switches on `upload.status`. In the `uploading` case, `progress`
   is a `number`, not `number | undefined`: why?

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 7. *(Bonus)* — a cancel

Add a `cancel` event that brings an `uploading` upload back to `idle`. How many
places does the checker send you to?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the thirty-one specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] No optional field left in `Image`, `Video`, `Audio` or `Upload`
- [ ] Every `switch` ends on `assertNever`
- [ ] No `as`, no `!`, no `any` in `src/`
- [ ] `parseAttachment` never returns its `input`

**You can explain**

- [ ] What makes a union **discriminated**, and what the checker does with it
- [ ] Why `assertNever` turns a forgotten case into a build error
- [ ] The difference between a type guard and an assertion function
- [ ] Why `{ status: 'done', progress: 1 }` is no longer a valid `Upload`

## Going further

- Remove the `default` branch of `describe`, and its return type. What does the
  checker infer, and what does a forgotten case cost now?
- `const kinds = ['image', 'video', 'audio'] as const satisfies readonly AttachmentKind[]`:
  write `isKind(value: unknown): value is AttachmentKind` with it.
- Rewrite `parseAttachment` with Zod (`z.discriminatedUnion`). How many lines
  are left?
