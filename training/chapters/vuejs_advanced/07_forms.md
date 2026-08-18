---
layout: cover
---

# 7 - Forms & validation

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Describe** a form with a **Zod schema**, and derive its TypeScript type from it
- **Build** a `useZodForm` composable from scratch — and **name** what it still lacks
- **Wire** VeeValidate with `useForm`, `defineField`, `useFieldArray` and
  `toTypedSchema`
- **Validate** across fields, **asynchronously**, and at the right moment
- **Map** a server-side `422` back onto the fields that caused it
- **Ship** a form that a keyboard and a screen reader can actually complete

---

# Why forms deserve a chapter

A form is the place where every hard part of the framework meets at once:

- **Local state** — a value, an initial value, a dirty flag, per field
- **Validation** — synchronous, cross-field, asynchronous, and server-side
- **Timing** — an error on the first keystroke is noise; on submit only, it is
  too late
- **Async** — a submit that can fail, be slow, or be fired twice
- **Accessibility** — the one screen where a missing `<label>` blocks the user
  entirely
- **Types** — the shape you display is *not* the shape you send

<br />

> `v-model` handles the first bullet. This chapter is about the other five.

---

# Where the hand-rolled version goes

```vue
<script setup lang="ts">
const email = ref('');
const password = ref('');
const emailError = ref('');
const passwordError = ref('');
const emailTouched = ref(false);
// ... and one more pair for every field you add

watch(email, () => {
  emailError.value = /.+@.+/.test(email.value) ? '' : 'Invalid email';
});
</script>
```

- Three `ref`s per field, and the rules live **in the component**
- The backend validates the same thing, in another language, with other messages
- Nothing tells you that `email` is `string` on screen and `Email` after parsing

---

# The schema is the source of truth

```ts
// src/schemas/signup.ts
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(12, 'At least 12 characters'),
  age: z.coerce.number().int().min(18, 'You must be 18 or over'),
  plan: z.enum(['free', 'pro']).default('free'),
});

export type SignupInput = z.input<typeof signupSchema>;    // what the form holds
export type Signup = z.output<typeof signupSchema>;        // what you send
```

- **One** declaration for the rules, the messages **and** the types
- `z.coerce.number()` is why `input` and `output` differ: `age` is a `string` in
  the `<input>`, a `number` after parsing
- The same file can be imported by a Node backend — one schema, both sides

---

# Reading a Zod failure

```ts
const result = signupSchema.safeParse(values);   // never throws
if (!result.success) {
  result.error.issues;   // [{ code, path: ['email'], message: 'Enter a valid…' }, …]
}
```

`path` is an **array of segments** — that is what you map onto your fields:

```ts
z.treeifyError(error);
// { errors: [], properties: { email: { errors: ['Enter a valid email address'] } } }

z.flattenError(error);
// { formErrors: [], fieldErrors: { email: ['Enter a valid email address'] } }

z.prettifyError(error);   // a multi-line string, for a CLI or a log
```

> Zod 3 spelled these `error.format()` and `error.flatten()`. Zod 4 moved them to
> top-level functions and made `issues` the stable, documented shape.

---

# `useZodForm` — the state

```ts
// src/composables/useZodForm.ts
export function useZodForm<S extends ZodType>(schema: S, initial: z.input<S>) {
  const values = reactive({ ...initial }) as z.input<S>;
  const errors = ref<Partial<Record<keyof z.input<S>, string>>>({});
  const touched = ref(new Set<string>());
  const submitCount = ref(0);

  const snapshot = JSON.stringify(initial);
  const isDirty = computed(() => JSON.stringify(values) !== snapshot);
  const isValid = computed(() => Object.keys(errors.value).length === 0);
```

- `values` is **one** reactive object, not one `ref` per field: the schema
  already describes the shape
- `touched` is what lets you show an error *after* the user leaves the field,
  not while they are still typing it

---

# `useZodForm` — validating

```ts
  function validate(): boolean {
    const result = schema.safeParse(values);
    errors.value = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof z.input<S>;
        errors.value[key] ??= issue.message;      // first message wins
      }
    }
    return result.success;
  }

  // Re-validate on change, but only surface errors for fields already touched
  watch(values, validate, { deep: true });

  function errorFor(field: string): string | undefined {
    return touched.value.has(field) || submitCount.value > 0
      ? errors.value[field as keyof z.input<S>]
      : undefined;
  }
```

---

# `useZodForm` — submitting

```ts
  const isSubmitting = ref(false);

  function handleSubmit(onValid: (data: z.output<S>) => Promise<void> | void) {
    return async (e?: Event) => {
      e?.preventDefault();
      submitCount.value++;
      const result = schema.safeParse(values);          // parse, not just validate
      if (!result.success) return void validate();
      isSubmitting.value = true;
      try { await onValid(result.data); }               // typed output, not `values`
      finally { isSubmitting.value = false; }
    };
  }

  return { values, errors, touched, isDirty, isValid, isSubmitting, submitCount,
           validate, errorFor, handleSubmit };
}
```

> Fifty lines, no dependency, and it covers the 80 % case. Write it once — you
> will read every form library differently afterwards.

---

# What the fifty lines do **not** do

- **Nested paths and arrays** — `issue.path[0]` collapses `lines[2].qty` onto
  `lines`
- **Per-field async rules** — "is this email already taken?", debounced, with a
  pending state, without racing
- **Validation timing** per field — on blur here, on input there, on submit for
  the rest
- **Field-level components** — a reusable `<TextField>` that knows its own error
- **Array helpers** — insert, remove, move, with keys stable enough for `v-for`
- **Devtools** — seeing the form state in the Vue panel

<br />

> Each one is a day of work and a source of subtle bugs. That is the moment a
> library earns its place.

---

# VeeValidate — two APIs, one engine

```vue
<!-- 1. Component API — declarative, good for simple forms -->
<Form :validation-schema="schema" @submit="onSubmit">
  <Field name="email" type="email" />
  <ErrorMessage name="email" />
  <button>Sign up</button>
</Form>
```

```vue
<!-- 2. Composition API — the one you want in a typed codebase -->
<script setup lang="ts">
const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema });
const [email, emailAttrs] = defineField('email');
</script>
```

- Same engine underneath; the composition API gives you the **types** and keeps
  the markup yours
- The component API shines for a form generated from a config object

---

# `useForm` — what you get back

```ts
const {
  values,          // reactive current values
  errors,          // Record<path, string> — first message per field
  meta,            // { valid, dirty, touched, pending, initialValues }
  defineField,     // [model, attrs] for a plain <input>
  handleSubmit,    // wraps your callback: validates, then calls it with the output
  setErrors,       // inject errors from anywhere — typically the server
  setFieldValue, setValues, resetForm, validate, validateField,
  isSubmitting, submitCount,
} = useForm({ validationSchema, initialValues });
```

- `errors` is keyed by **path**, in bracket syntax for arrays:
  `'lines[0].qty'`
- `meta.valid` is the whole form; `meta.dirty` is what an "unsaved changes"
  guard reads

---

# `defineField` — binding a plain input

```vue
<script setup lang="ts">
const { defineField, errors } = useForm({ validationSchema: schema });

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password', {
  validateOnModelUpdate: false,        // this one validates on blur only
});
</script>

<template>
  <input v-model="email" v-bind="emailAttrs" type="email" />
  <span>{{ errors.email }}</span>
</template>
```

- `email` is a writable `Ref` — `v-model` works as usual
- `emailAttrs` carries the listeners (`onInput`, `onChange`, `onBlur`) that drive
  the timing. Forget `v-bind` and blur validation silently stops working

---

# `toTypedSchema` — the bridge

```ts
import { toTypedSchema } from '@vee-validate/zod';

const { defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(signupSchema),
});
```

Two jobs, and neither is magic:

1. **Runtime** — call `safeParseAsync`, turn `issues` into
   `[{ path: 'lines[0].qty', errors: [...] }]`, which is the only shape
   VeeValidate understands
2. **Types** — carry `z.input` into `values` and `z.output` into
   `handleSubmit`, so the form is typed end to end from the schema

<br />

> Adapters exist for Yup, Valibot and Joi too. They all implement the same
> `{ __type: 'VVTypedSchema', parse(values) }` contract.

---

# The adapter, in fifteen lines

```ts
export function toTypedSchema<S extends ZodType>(schema: S) {
  return {
    __type: 'VVTypedSchema',
    async parse(values: unknown) {
      const result = await schema.safeParseAsync(values);
      if (result.success) return { value: result.data, errors: [] };

      const errors: Record<string, { path: string; errors: string[] }> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.reduce<string>(
          (acc, k) => (typeof k === 'number' ? `${acc}[${k}]` : acc ? `${acc}.${k}` : `${k}`),
          '',
        );
        (errors[path] ??= { path, errors: [] }).errors.push(issue.message);
      }
      return { errors: Object.values(errors) };
    },
  };
}
```

> Worth reading once: it explains every "my error does not show up" bug you will
> ever file — the path did not match the field name.

---

# ⚠️ Zod 3, Zod 4, and Standard Schema

- `@vee-validate/zod` **4.15** declares `peerDependencies: { zod: "^3.24.0" }` —
  and it means it: it imports `ZodFirstPartyTypeKind` and reads `_def.typeName`,
  both **removed in Zod 4**
- Install Zod 4 next to it and `npm install` fails on `ERESOLVE`; force it and
  the *defaults* and *union* paths break silently

<br />

Three honest options today:

| Option | What it costs |
|---|---|
| `zod@3.25.x` + the official adapter | the v3 API at the root import (`zod/v4` is there when you need it) |
| Zod 4 + the fifteen-line adapter above | you own thirty lines |
| **VeeValidate 5** (beta) | no adapter at all — it consumes **Standard Schema**, which Zod 4, Valibot and ArkType all implement |

---

# Standard Schema, in one slide

```ts
const schema = z.object({ email: z.email() });

schema['~standard'];        // { version: 1, vendor: 'zod', validate(value) { … } }
```

- A **common interface** every validation library agreed on: one property,
  `~standard`, exposing `validate(value)` and a `{ value }` / `{ issues }` result
- Consumers (tRPC, TanStack Form, VeeValidate 5, Nuxt) stop shipping one adapter
  per library
- The lesson for **your** code: type the boundary against `StandardSchemaV1`, not
  against `ZodType`, and swapping Zod for Valibot becomes a one-line change

---

# Input vs output — the trap

```ts
const schema = z.object({
  age: z.coerce.number().min(18),
  consent: z.boolean().default(false),
});

const { values, handleSubmit } = useForm({ validationSchema: toTypedSchema(schema) });

values.age;                                  // string  — what the <input> holds

handleSubmit((data) => {
  data.age;                                  // number  — parsed
  data.consent;                              // false   — the default was applied
  api.signup(data);                          // never send `values`
});
```

- `handleSubmit` hands you the **schema output**, not the model
- Defaults, coercions and transforms only exist on that side of the parse

---

# Cross-field rules

```ts
const schema = z
  .object({
    password: z.string().min(12),
    confirm: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],                       // ← attaches the error to a field
  })
  .refine((v) => v.endsAt >= v.startsAt, {
    message: 'The end date must come after the start date',
    path: ['endsAt'],
  });
```

- Without `path`, the issue lands at the **form** level and no field displays it
- `.superRefine()` when one pass must raise **several** issues, or when the
  message depends on the value

---

# Field arrays

```vue
<script setup lang="ts">
const { fields, push, remove, move } = useFieldArray<Line>('lines');
</script>

<template>
  <div v-for="(field, idx) in fields" :key="field.key">
    <input v-model="field.value.label" :name="`lines[${idx}].label`" />
    <span>{{ errors[`lines[${idx}].label`] }}</span>
    <button type="button" @click="remove(idx)">Remove</button>
  </div>
  <button type="button" @click="push({ label: '', qty: 1 })">Add a line</button>
</template>
```

- **`field.key`, never `idx`**, as the `:key` — removing a middle row otherwise
  shifts every value up by one
- The array path syntax is `lines[0].label`; that is exactly what the adapter
  builds from `issue.path`

---

# Asynchronous rules

```ts
const emailSchema = z.email().refine(
  async (value) => (await api.isEmailAvailable(value)).available,
  { message: 'This email is already registered' },
);
```

- Use `safeParseAsync` — and `toTypedSchema` already does
- `meta.pending` is true while a rule is in flight: disable the submit button,
  do not show a green tick yet

```ts
const [email, emailAttrs] = defineField('email', {
  validateOnModelUpdate: false,      // wait for blur — one request per field, not per keystroke
});
```

- One HTTP call per keystroke is a self-inflicted DDoS. Validate on **blur**, or
  debounce with `useDebounceFn` from VueUse
- The server checks it **again** on submit: a client-side check is UX, never a
  guarantee

---

# Timing: when does an error appear?

| Option | Default | Use it for |
|---|---|---|
| `validateOnMount` | `false` | almost never — a form red on arrival |
| `validateOnValueUpdate` / `validateOnModelUpdate` | `true` | short, cheap, synchronous rules |
| `validateOnBlur` | `true` | async rules, formats the user is still typing |
| `validateOnInput` | `false` | live counters ("12 / 20 characters") |

<br />

> The rule of thumb: **be lenient on the way in, strict on the way out**.
> First keystroke → say nothing. After the first blur → validate on every change,
> so the user sees the error clear as they fix it.

---

# Submitting

```ts
const onSubmit = handleSubmit(
  async (data, { resetForm }) => {
    await api.signup(data);
    resetForm();                            // clears values, errors, dirty and touched
  },
  ({ errors }) => focusFirstError(errors),  // 2nd argument: the *invalid* submit
);
```

```vue
<form novalidate @submit="onSubmit">
  <button :disabled="isSubmitting || !meta.valid">
    {{ isSubmitting ? 'Signing up…' : 'Sign up' }}
  </button>
</form>
```

- `handleSubmit` **prevents the default** and refuses to call you when invalid
- `isSubmitting` guards the double-click; `submitCount` is how you switch from
  "quiet" to "show everything"
- `novalidate` turns off the browser's own bubbles — you now own the messages

---

# Server errors belong on the fields

```ts
const onSubmit = handleSubmit(async (data, { setErrors }) => {
  try {
    await api.signup(data);
  } catch (e) {
    if (e instanceof ApiValidationError) {
      // { email: 'Already registered', 'lines[1].qty': 'Out of stock' }
      setErrors(e.fieldErrors);
      return;
    }
    formError.value = 'Something went wrong. Try again.';   // form-level fallback
  }
});
```

- A `422` that shows up as a red banner and leaves the fields clean is a bug
- Your API contract should return **paths**, not prose — the same paths the
  schema uses. If the backend runs the same Zod schema, `issue.path` is free
- Errors set this way are cleared by the next validation run

---

# A reusable field component

```vue
<!-- TextField.vue -->
<script setup lang="ts">
const props = defineProps<{ name: string; label: string; type?: string }>();
const { value, errorMessage, handleBlur, handleChange, meta } = useField<string>(
  () => props.name,          // a getter: the field follows a dynamic name
);
const id = useId();          // Vue 3.5 — stable across SSR and hydration
</script>

<template>
  <label :for="id">{{ label }}</label>
  <input :id="id" v-model="value" :type="type ?? 'text'"
         :aria-invalid="!!errorMessage" :aria-describedby="errorMessage ? `${id}-err` : undefined"
         @blur="handleBlur" @change="handleChange" />
  <p v-if="errorMessage" :id="`${id}-err`" class="error">{{ errorMessage }}</p>
</template>
```

> `useField` finds the parent form by injection. Write this component **once**,
> and every form in the app becomes accessible by default.

---

# Accessibility — the non-negotiable list

- A real **`<label for>`** per input. A placeholder is not a label: it disappears
  the moment you type
- **`aria-invalid="true"`** on the field, and **`aria-describedby`** pointing at
  the message — otherwise a screen reader announces the input with no error at all
- The message must be in a **live region** (`role="alert"`) to be announced when
  it appears
- On an invalid submit: an **error summary** at the top, with links to each field,
  and move the **focus** to it
- Never signal an error with **colour alone** — icon, text, or both
- **`autocomplete`** on every identity field (`email`, `new-password`,
  `street-address`): it is accessibility *and* conversion

---

# The unsaved-changes guard

```ts
const { meta } = useForm({ validationSchema });

onBeforeRouteLeave(() => {
  if (!meta.value.dirty) return true;
  return window.confirm('You have unsaved changes. Leave anyway?');
});

useEventListener(window, 'beforeunload', (e) => {
  if (meta.value.dirty) e.preventDefault();      // browser's own dialog, no custom text
});
```

- `meta.dirty` compares against `initialValues` — so `resetForm({ values })`
  after a successful save is what turns the guard off
- Chapter 5's navigation guards and this chapter's form state meet exactly here
- Keep it for forms that are genuinely long. On a two-field form it is friction

---

# Testing a form

```ts
it('shows one error per invalid field and never calls the API', async () => {
  const signup = vi.fn();
  render(SignupForm, { global: { provide: { api: { signup } } } });

  await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
  await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

  expect(await screen.findByText('Enter a valid email address')).toBeVisible();
  expect(signup).not.toHaveBeenCalled();
});
```

- Query by **label**: the test fails when the `<label for>` breaks, which is
  exactly the bug you want caught
- Validation is `async` — always `findBy*`, never `getBy*`, right after a submit
- Test the schema separately, with plain `safeParse` calls: no component, no DOM,
  one hundred cases in milliseconds

---

# When *not* to reach for a form library

- **One or two fields** (a search box, a filter) — `v-model` and a `computed` are
  the whole story
- A form whose fields are **entirely driven by data** — you are writing a form
  *generator*; a schema plus your own renderer may be simpler than fighting one
- Reactivity-heavy wizards where the *shape* changes per step — split it into one
  form per step, with a schema per step, and merge at the end

<br />

> And in every case, keep the schema. It is useful with or without a library —
> it is the only part the backend can share.

---

# Recap

- The **schema** holds the rules, the messages and the types — one file, both
  sides of the wire
- Zod's `issues[].path` is the contract; every adapter and every server error map
  onto it
- Fifty lines give you a working `useZodForm`; arrays, async rules and timing are
  what you buy a library for
- `useForm` + `defineField` + `toTypedSchema` types a form end to end, from the
  `<input>` to the API call
- `handleSubmit` hands you the **output** of the schema, never the raw model
- `setErrors` puts a `422` back where it belongs — on the fields
- **Label, `aria-invalid`, `aria-describedby`, error summary, focus** — a form
  nobody can complete has no validation problem left to solve

---

# Quiz — Question 1 / 5

**Your schema uses `z.coerce.number()` for `age`. In `handleSubmit((data) => …)`,
what is the type of `data.age`?**

- **A.** `string`, like the `<input>` value
- **B.** `number` — `handleSubmit` receives the schema's parsed **output**
- **C.** `unknown`, until you cast it
- **D.** `string | number`, depending on the browser

<v-click>

> ✅ **B** — `values` holds `z.input` (what the DOM gives you), `handleSubmit`
> hands you `z.output` (what the parse produced). Coercions, defaults and
> transforms only exist on the output side. This is also why you send `data` to
> the API, never `values`.

</v-click>

---

# Quiz — Question 2 / 5

**A `.refine()` checks that `confirm` equals `password`. The message never shows
up next to the confirmation field. Why?**

- **A.** `.refine()` cannot compare two fields — use `.superRefine()`
- **B.** VeeValidate ignores refinements
- **C.** The refinement has no `path`, so the issue is attached to the form, not
  to a field
- **D.** The two fields must be in a nested object

<v-click>

> ✅ **C** — An issue with an empty `path` is a form-level error. Add
> `{ path: ['confirm'] }` and the adapter keys it under `confirm`, where
> `errors.confirm` and `<ErrorMessage name="confirm" />` can find it.

</v-click>

---

# Quiz — Question 3 / 5

**In a `useFieldArray`, you use the loop index as the `:key`. What breaks?**

- **A.** Nothing — the index is unique
- **B.** Removing a row in the middle shifts the DOM state: values, focus and
  errors move up one row
- **C.** Validation stops running on the array
- **D.** `push()` no longer triggers a re-render

<v-click>

> ✅ **B** — `fields` exposes a stable `key` per entry precisely because the index
> is not stable. With `:key="idx"`, Vue reuses the node of the deleted row for its
> successor, and the user watches their input jump one line up.

</v-click>

---

# Quiz — Question 4 / 5

**Your API answers `422` with `{ email: 'Already registered' }`. What do you do
with it?**

- **A.** Show a red banner above the form
- **B.** `setErrors({ email: 'Already registered' })` from the `handleSubmit`
  callback
- **C.** Add a `.refine()` to the schema that calls the API
- **D.** `throw` — the global error handler will deal with it

<v-click>

> ✅ **B** — `setErrors` uses the same paths as the schema, so the message lands
> on the field, next to the input the user has to fix, and clears itself on the
> next validation. A form-level banner stays useful as a **fallback** for errors
> that belong to no field (network, `500`).

</v-click>

---

# Quiz — Question 5 / 5

**Which of these is enough, on its own, to make an error message reach a screen
reader user?**

- **A.** A red border on the input
- **B.** A `<p class="error">` right after the input
- **C.** `aria-invalid` on the input plus `aria-describedby` pointing at the
  message's `id`
- **D.** `placeholder="Invalid email"`

<v-click>

> ✅ **C** — Visual proximity means nothing to a screen reader: unless the message
> is associated with the field, it is never announced with it. `aria-invalid`
> marks the state, `aria-describedby` attaches the text, and `role="alert"` makes
> it announced the moment it appears.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 7 - Forms & validation — 60 min

In `tp/07_forms`:

1. Write the **Zod schema** for the sign-up form, and derive its types
2. Fill in the **`useZodForm`** composable — errors, `touched`, submit
3. Redo the same form with **VeeValidate** and `toTypedSchema`, and compare
4. Add the **cross-field** rule, the **field array** and the **async** email check
5. Map the API's `422` back onto the fields with `setErrors`
6. Make it accessible: labels, `aria-invalid`, error summary, focus management
7. *(Bonus)* Port the schema to **Zod 4** and write your own adapter

**Done when** a keyboard-only user can complete the form, and every error —
client-side, cross-field, async or server-side — appears next to the field that
caused it.

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
