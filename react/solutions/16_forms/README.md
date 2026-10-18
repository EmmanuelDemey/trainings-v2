# TP 16 — Forms: React 19 actions and React Hook Form

> This TP is **autonomous**: it does not depend on any other TP. The fake API,
> the field components and the page are provided and working; your job is to
> build the "create a person" form twice — once with a React 19 form action,
> once with React Hook Form — on top of ONE Zod schema.

## Goal

Chapter 16 — Build the same form the two ways a React 19 application does it today:

- **One schema** (Zod 4) describing a valid person — the single source of the rules
- **Uncontrolled + `FormData`**: a React 19 `<form action>`, `useActionState` for the
  result, `useFormStatus` for the pending button
- **React Hook Form** with `zodResolver`: validation on blur, errors, submit state,
  a server error mapped onto a field
- **Accessible errors**: `aria-invalid` and `aria-describedby`, so a screen reader
  announces what is wrong with which field

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the API is mocked by MSW in the browser
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Every step comes with its specs already written, next to the code they grade:

| Spec | Grades |
|---|---|
| `src/schemas/person.spec.ts` | step 1 — the schema, rule by rule, message by message |
| `src/actions/createPersonAction.spec.ts` | step 2 — the action as a plain async function |
| `src/components/ActionForm.spec.tsx` | step 2 — the action form, from the user's side |
| `src/components/HookForm.spec.tsx` | step 3 — the React Hook Form version (its "wires each error" test needs step 4) |
| `src/components/fields.spec.tsx` | step 4 — the accessibility of the fields |

They are red on the starter; keep `npm run test:watch` in a second terminal and
make them go green, one file after the other.

**Already done for you:**

- `src/mocks/` — the fake backend. `POST /api/people` stores the person, answers
  `201` with its new `id` — or `409` when the name is already taken (try
  "Luke Skywalker"). MSW serves it to the browser in dev (`src/main.tsx`) and to
  the specs (`src/tests/setup.ts`), from the same `handlers.ts`.
- `src/api/people.ts` — `createPerson(input)`, which throws an `ApiError` carrying
  the server's message when the answer is not OK.
- `src/components/fields.tsx` — `TextField`, `SelectField` and `RadioGroupField`:
  a label, the control, and the error message under it. Every other prop goes to
  the control — including `ref`, a plain prop in React 19.
- `src/App.tsx` — both forms side by side, and the list of the people created.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Write the rules of a valid person | `src/schemas/person.ts` | `person.spec.ts` is green |
| 2 | The uncontrolled form: an action, `useActionState`, `useFormStatus` | `src/actions/createPersonAction.ts`, `src/components/ActionForm.tsx`, `src/components/SubmitButton.tsx` | Submitting shows the errors, keeps what was typed, and creates the person |
| 3 | The same form with React Hook Form + `zodResolver` | `src/components/HookForm.tsx` | Errors appear when a field is left, the submit sends a numeric height |
| 4 | Accessible errors | `src/components/fields.tsx` | Each message is the accessible description of its field |

## Steps

### 1. The schema — `src/schemas/person.ts`

The `name` rule is written for you: it is the model. Zod 4 takes every message as
`{ error: '…' }`.

1. `height`: `z.number({ error: 'Height must be a number' })`, then `.int(…)`,
   `.min(0, …)` and `.max(250, …)`. An empty number field is read as `NaN` (step 2 and
   step 3 both do it), and `z.number()` refuses `NaN` with that same message.
2. `hairColor` and `gender`: `z.enum(HAIR_COLORS, { error: '…' })`. An empty
   `<select>` sends `""`; a radio group with nothing checked sends nothing at all —
   both must give the message.
3. `birthYear`: a `.regex()` for `19BBY`, `41.9BBY`, `4ABY`.

Hover `PersonFormValues` and `PersonInput` in your editor: `z.input` and `z.output`
of the same schema. Where do they differ, once your enums are written?

→ **Done when** `src/schemas/person.spec.ts` is green.

### 2. A React 19 form action — `src/actions/createPersonAction.ts`, `src/components/ActionForm.tsx`, `src/components/SubmitButton.tsx`

No `useState` per field, no `onChange`, no `preventDefault`: the form holds the
values, and React hands them to your action as a `FormData`.

1. In `createPersonAction`, turn the `FormData` into an object of strings
   (`Object.fromEntries`, keeping only the `string` values), convert `height` to a
   number — an empty field must become `NaN`: `Number('')` is `0`, a valid height! —
   and `safeParse` the result.
2. Invalid: return `{ status: 'invalid', errors, values }`. `z.flattenError(error)
   .fieldErrors` gives the messages per field; keep the first of each.
3. Valid: `await createPerson(result.data)` and return `{ status: 'success', person }`.
   An `ApiError` (the 409) becomes `{ status: 'failed', message, values }`.
4. In `ActionForm`, call `useActionState` with an action that awaits
   `createPersonAction` and calls `onCreated` on a success. Give the returned
   `formAction` to `<form action={…}>` and remove the `onSubmit`.
5. In `SubmitButton`, read `pending` from `useFormStatus()` (`react-dom`): disable
   the button and label it `Saving…`. Why must it be a component of its own,
   rendered *inside* the `<form>`?
6. Render the state: each field's `error`, the server's `message` in a
   `<p role="alert">`, and `"<name> was created"` in a `<p role="status">`.
   Submit an invalid form: **the fields are emptied**. React resets an action form
   once the action is done — give each field `defaultValue={values.…}` (and the
   radio group `defaultValue`) from the state, so that a reset puts back what the
   user typed.

→ **Done when** both step 2 spec files are green, and in the browser an invalid
submit shows every error while keeping what was typed.

### 3. React Hook Form + Zod — `src/components/HookForm.tsx`

1. `useForm({ resolver: zodResolver(personSchema), mode: 'onTouched', defaultValues:
   { name: '', birthYear: '' } })`. Note that you pass **no type argument**: the
   form's types come from the schema.
2. Spread `{...register('name')}` on each field — it gives `name`, `onChange`,
   `onBlur` and `ref`, so remove the `name` prop — and pass
   `errors.name?.message` as `error`. The height is
   `register('height', { valueAsNumber: true })`: React Hook Form reads the field as
   a number (`NaN` when empty), which is what the schema expects.
3. `onSubmit={handleSubmit(async (person) => …)}`: `handleSubmit` only calls you
   once the schema accepted the values — typed as the schema's output.
   `createPerson`, `onCreated`, then `reset()`. On an `ApiError`, put its message on
   the name field with `setError('name', { message })`.
4. Disable the button and label it `Saving…` while `formState.isSubmitting`.

Submit the empty form: the focus jumps to the first invalid field. You did not
write that — what does React Hook Form need for it (look at what `register` returns)?

→ **Done when** `src/components/HookForm.spec.tsx` is green except "wires each error
to its field", which waits for step 4.

### 4. Accessible errors — `src/components/fields.tsx`

A red message under a field is invisible to a screen reader: nothing ties it to
the field. Fix it once, in the field components, and both forms get it.

1. On the `<input>` and the `<select>`: `aria-invalid` when there is an `error`.
2. Give the message `id={`${id}-error`}` and point `aria-describedby` at it — only
   when there is an error (a description pointing at nothing is a bug too).
3. The same on the radio group's `<fieldset role="radiogroup">`.

Check it in the browser: the DevTools' **Accessibility** pane shows the field's
*Description*. The stylesheet already uses `[aria-invalid='true']` to draw the red
border — no `has-error` class to keep in sync.

→ **Done when** `npm test` is entirely green.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the schema, the action, both forms and the fields
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No React warning in the browser console while you use both forms

**The behaviour is there**

- [ ] Both forms refuse an empty name, an empty height or one of `300`, no hair color, no
      gender and a birth year of `1977` — with the same messages
- [ ] An invalid submit of the action form keeps what the user typed
- [ ] The button says `Saving…` and is disabled while the request runs (the dev API
      waits 100–400 ms)
- [ ] "Luke Skywalker" is refused with the server's message, in both forms
- [ ] A created person appears in the list, with a numeric height, and the form is emptied
- [ ] The React Hook Form version shows a field's error when the field is left, not
      while it is typed for the first time
- [ ] Every message is the accessible description of its field, and the field is `aria-invalid`

**You can explain**

- [ ] Why an empty number field must become `NaN` and not `0`, and what `z.input` /
      `z.output` are for
- [ ] Why `useFormStatus` lives in a child component of the `<form>`
- [ ] Why the action form needs `defaultValue` from the state after an invalid submit
- [ ] Why `register` does not re-render the form at each keystroke, where a
      `useState` per field would
- [ ] What a screen reader says for an invalid field, with and without `aria-describedby`

## Going further

- Turn the action form into a **controlled** one (`useState` per field) and count
  the renders with the React DevTools' "Highlight updates": compare with both
  versions you wrote.
- Add `useOptimistic` to the action form: show the new person in the list at once,
  with a "saving…" badge, and let React roll it back when the server says 409.
- Validate the name against the server **while typing** in the React Hook Form
  version, with an async `refine` debounced — and think about what happens to the
  request of the previous keystroke.
- Replace the `<select>` with a MUI `Autocomplete` (TP 18): React Hook Form's
  `Controller` is how a component that has no `ref` to an `<input>` is registered.
