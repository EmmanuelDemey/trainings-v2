# TP 7 — Forms & validation

> This TP is **autonomous**: it does not depend on any other TP. The app runs as
> shipped — it simply never shows an error, because the schema has no rule and
> the composable validates nothing. Your job is to make it say something.

## Goal

Chapter 7 — Build the same registration form twice, on one Zod schema:

- **A schema** that holds the rules, the messages *and* the types
- **`useZodForm`**, written by hand, so you know what a form library actually does
- **VeeValidate** with `toTypedSchema`, `useFieldArray` and `defineField`
- **Cross-field, asynchronous and server-side** errors, all landing on the right input
- **Accessibility**: labels, `aria-invalid`, `aria-describedby`, an error summary
  and focus management

## Prerequisites

- **Node.js >= 22** — run `nvm use` to pick up the version from `.nvmrc`
- The **Vue Devtools** browser extension

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
```

The app has two tabs — the hand-rolled form and the VeeValidate one — and a
footer showing the fake API's call counters. The "server" knows three registered
emails (`ada@lovelace.dev`, `grace@hopper.dev`, `alan@turing.dev`), rejects any
attendee named `Bob`, and requires a company on the `pro` plan.

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

### 2. The hand-rolled form — `src/composables/useZodForm.ts`

Fill in `TODO 2.1` to `TODO 2.5`. `HandRolledForm.vue` is already wired to the
composable's API — you should not need to touch its template.

The one detail that matters: `issue.path` is an **array of segments**, and the
inputs are named `attendees[0].name`. Rebuild that string, or nested errors will
never reach their field.

**Check it**: submit the empty form — one error per faulty field, including
inside the attendee row. Then type in a field: its error clears as you fix it,
and *no* error appears on a field you have not visited yet.

### 3. The same form with VeeValidate — `src/components/VeeForm.vue`

Fill in `TODO 3.1` to `TODO 3.3` and use `<TextField>` for every text input.

Compare the two files when you are done: what disappeared, and what did you
have to give up?

### 4. Arrays and async — `TODO 4.1` to `TODO 4.3`

1. `useFieldArray('attendees')`, keyed by **`field.key`**. Fill three rows,
   remove the middle one, and check that no value moved up. Then try `:key="idx"`
   and watch it break.
2. The availability check: an async `.refine()` on the schema. Get it working
   first, *then* look at the call counter and bring it down.

### 5. Server errors — `TODO 5.1`

Register with an attendee named `Bob`: the server answers `422` with
`attendees[0].name`. The message must appear under that input, not in a banner.

### 6. Accessibility — `TODO 6.1` to `TODO 6.6`

In `TextField.vue` and `ErrorSummary.vue`. Test it with the keyboard only: `Tab`
to every field, submit with `Enter`, and check that the focus lands on the
summary — and that its links take you to the faulty inputs.

### 7. *(Bonus)* Zod 4

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
  (chapter 5) and `beforeunload`.
- Write the form's tests with Testing Library: query by label, assert one error
  per field, and check that the API is never called on an invalid submit
  (chapter 8).
- Swap Zod for Valibot behind the same `TypedSchema` contract, and measure the
  difference in the bundle.
