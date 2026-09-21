# TP 11 — Forms & validation

> This TP is **autonomous**: it does not depend on any other TP. The app runs as
> shipped — it simply never shows an error, because the schema has no rule and
> the composable validates nothing. Your job is to make it say something.

## Goal

Chapter 11 — Build the same registration form twice, on one Zod schema:

- **A schema** that holds the rules, the messages *and* the types
- **`useZodForm`**, written by hand, so you know what a form library actually does
- **VeeValidate** with `toTypedSchema`, `useFieldArray` and `defineField`
- **Cross-field, asynchronous and server-side** errors, all landing on the right input
- **Accessibility**: labels, `aria-invalid`, `aria-describedby`, an error summary
  and focus management

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- The **Vue Devtools** browser extension

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Steps 1 and 2 come with their specs already written:
**`tests/registration.spec.ts`** is the rule list below, written down — every
message, the `age` that arrives as a string and leaves as a number, the mismatch
that has to land on `confirm`, and the server error that must display like any
other. It is red on the skeleton; keep `npm run test:watch` in a second terminal.

It stops at the edge of the DOM on purpose: the focus management and the `aria-*`
wiring of step 5 are checked in the browser, where they mean something.

The app has two tabs — the hand-rolled form and the VeeValidate one — and a
footer showing the fake API's call counters. The "server" knows three registered
emails (`ada@lovelace.dev`, `grace@hopper.dev`, `alan@turing.dev`), rejects any
attendee named `Bob`, and requires a company on the `pro` plan.

## The workshop at a glance

The TODO markers are numbered by step, so `TODO 4.2` belongs to step 4 wherever
it lives. `grep -rn "TODO 4\." src` finds a step's work in one command.

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Write the validation rules, and let the types fall out of them | `src/schemas/registration.ts` | `z.input` and `z.output` genuinely differ on `age` |
| 2 | Wire a schema to a form by hand, once, to see the plumbing | `src/composables/useZodForm.ts` | A nested error reaches `attendees[0].name`, not the form |
| 3 | Submit the VeeValidate form, server errors included | `src/components/VeeForm.vue` | The `Bob` rejection shows under the attendee's name |
| 4 | A repeatable row, and an async rule that hits the server | `VeeForm.vue` + `registration.ts` | Removing the middle row moves no value; the call counter stays low |
| 5 | Make the form usable without a mouse | `TextField.vue` + `ErrorSummary.vue` | A failed submit moves the focus to the summary, whose links reach the inputs |

`npm test` grades steps 1 and 2. Steps 3 to 5 are graded in the browser — the
last one with the keyboard only.

## Steps

### 1. The schema — `src/schemas/registration.ts`

Fill in `TODO 1.1` to `TODO 1.9`. Every rule carries its own message; the types
come out of the schema, not the other way round.

Two of them are worth slowing down on:

- **`age`** — the `<input>` holds a string, the API wants a number. Keep the
  *input* a string and make the *output* a number, so `z.input` and `z.output`
  genuinely differ.
- **`confirm`** — a `.refine()` on the object, with a `path`. Without the `path`,
  the error lands on the form and no field ever shows it.

**Check it**: `npm run typecheck` stays green, and `emptyRegistration` still
compiles.

→ **Done when** every rule carries its own message, `age` comes out a number,
and the mismatch error lands on `confirm`.

### 2. The hand-rolled form — `src/composables/useZodForm.ts`

Fill in `TODO 2.1` to `TODO 2.5`. `HandRolledForm.vue` is already wired to the
composable's API — you should not need to touch its template.

The one detail that matters: `issue.path` is an **array of segments**, and the
inputs are named `attendees[0].name`. Rebuild that string, or nested errors will
never reach their field.

**Check it**: submit the empty form — one error per faulty field, including
inside the attendee row. Then type in a field: its error clears as you fix it,
and *no* error appears on a field you have not visited yet.

→ **Done when** a nested error reaches `attendees[0].name`, and an untouched
field shows nothing.

### 3. The same form with VeeValidate — `src/components/VeeForm.vue`

Already done for you: every field is on the page — one `<TextField>` per text
input, and `plan`, `company` and `consent` bound by hand with `defineField` —
and the schema requires `company` on the pro plan. Read the file once.

Fill in `TODO 3.1` and `TODO 3.2`: the real submit, then the server's answer.
Register with an attendee named `Bob`: the server answers `422` with
`attendees[0].name`, and the message must appear under that input, not in a
banner.

Compare the file with `HandRolledForm.vue` when you are done: what disappeared,
and what did you have to give up?

→ **Done when** the success message says the age was sent as a `number`, and
the server's message displays exactly like a client-side one.

### 4. Arrays and async — `src/components/VeeForm.vue` + `src/schemas/registration.ts`

1. `useFieldArray('attendees')`, keyed by **`field.key`**. Fill three rows,
   remove the middle one, and check that no value moved up. Then try `:key="idx"`
   and watch it break.
2. The availability check: an async `.refine()` on the schema, built on the
   `checkAvailability` helper that is already there (it caches one answer per
   email). Get it working first, *then* look at the call counter and bring it
   down.

→ **Done when** removing the middle row leaves the other two untouched, and the
availability counter no longer moves on every keystroke.

### 5. Accessibility — `src/components/TextField.vue` + `src/components/ErrorSummary.vue`

Fill in `TODO 5.1` to `TODO 5.5`. Test it with the keyboard only: `Tab`
to every field, submit with `Enter`, and check that the focus lands on the
summary — and that its links take you to the faulty inputs.

→ **Done when** you have filled and submitted the whole form without touching
the mouse once.

### 6. *(Bonus)* Zod 4

`@vee-validate/zod` is a **Zod 3** package: it reads internals that no longer
exist in Zod 4. The `zod` package installed here ships both — `zod` is v3,
`zod/v4` is v4.

Port `registration.ts` to `import { z } from 'zod/v4'` and replace the official
adapter with your own (fifteen lines: `safeParseAsync`, then `issues` mapped to
`{ path, errors }`). Then look at `schema['~standard']` and explain what
VeeValidate 5 gets for free.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the schema messages, the `age` conversion and `useZodForm`
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src | grep -vi bonus` returns nothing
- [ ] No Vue or VeeValidate warning in the browser console

**The behaviour is there**

- [ ] Submitting the empty form shows one message per faulty field, in **both** tabs
- [ ] `z.input<typeof registrationSchema>['age']` is a `string` and
      `z.output<…>['age']` is a `number`, and the success message proves a number
      was sent
- [ ] "Passwords do not match" appears under `confirm`, not at the top of the form
- [ ] An error on `attendees[0].name` shows under that row's input — in the
      hand-rolled form **and** in the VeeValidate one
- [ ] Nothing is flagged before the field has been left, or before the first submit
- [ ] Removing the middle attendee row leaves the other rows' values in place
- [ ] Typing a full email raises **at most one** availability call, and typing in
      another field raises none
- [ ] Registering with `Bob` puts the server's message under the attendee's name
- [ ] Every input has a `<label for>`, an `aria-invalid` when it is in error, and an
      `aria-describedby` pointing at its message
- [ ] An invalid submit moves the focus to the summary, and its links reach the fields
- [ ] The whole form can be completed with the keyboard alone

**You can explain**

- [ ] What `toTypedSchema` does at runtime, and what it does at compile time
- [ ] Why `handleSubmit` gives you something other than `values`
- [ ] Why a field-level rule is ignored once the form has a `validationSchema`
- [ ] What `field.key` protects you from, in one sentence

## Going further

- Replace `fieldId()` with Vue 3.5's `useId()`, and find another way for the
  summary to reach the inputs.
- Add an "unsaved changes" guard: `meta.dirty` plus `onBeforeRouteLeave`
  (chapter 6) and `beforeunload`.
- Write the form's tests with Testing Library: query by label, assert one error
  per field, and check that the API is never called on an invalid submit
  (chapter 12).
- Swap Zod for Valibot behind the same `TypedSchema` contract, and measure the
  difference in the bundle.
