---
layout: cover
---

# 11 - Forms & validation

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Describe** a form with a **Zod schema**, and derive both of its TypeScript
  types from it — `z.input` on screen, `z.output` on the wire
- **Choose** between VeeValidate's component API and its composition API
- **Wire** a form end to end with `useForm`, `defineField` and `toTypedSchema`
- **Attach** a cross-field rule to the right field with `.refine()` and its `path`
- **Map** a server-side `422` back onto the fields that caused it, with `setErrors`
- **Ship** a form that a keyboard and a screen reader can actually complete

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

1. **Runtime** — call `safeParseAsync`. A failed parse returns `issues`: one entry
   per broken rule, each carrying a `path` **array** (`['lines', 0, 'qty']`) and a
   message. The adapter joins that path into
   `[{ path: 'lines[0].qty', errors: [...] }]`, the only shape VeeValidate understands
2. **Types** — carry `z.input` into `values` and `z.output` into
   `handleSubmit`, so the form is typed end to end from the schema

<br />

> Adapters exist for Yup, Valibot and Joi too. They all implement the same
> `{ __type: 'VVTypedSchema', parse(values) }` contract.

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

# Recap

- The **schema** holds the rules, the messages and the types — one file, both
  sides of the wire
- `useForm` + `defineField` + `toTypedSchema` types a form end to end, from the
  `<input>` to the API call — and `v-bind="…Attrs"` is what keeps the timing working
- A Zod issue's **`path`** is the contract: the adapter turns it into
  `lines[0].qty`, and `errors` and `setErrors` are keyed by that same string
- `handleSubmit` hands you the **output** of the schema, never the raw `values`
- A `.refine()` without a `path` is a **form-level** error: no field will show it
- `setErrors` puts a `422` back where it belongs — on the fields
- **Label, `aria-invalid`, `aria-describedby`, error summary, focus** — a form
  nobody can complete has no validation problem left to solve

---

# Quiz — Question 1 / 3

**Your schema uses `z.coerce.number()` for `age`. In `handleSubmit((data) => …)`,
what is the type of `data.age`?**

- **A.** `number` — `handleSubmit` receives the schema's parsed **output**
- **B.** `string`, like the `<input>` value
- **C.** `unknown`, until you cast it
- **D.** `string | number`, depending on the browser

<v-click>

> ✅ **A** — `values` holds `z.input` (what the DOM gives you), `handleSubmit`
> hands you `z.output` (what the parse produced). Coercions, defaults and
> transforms only exist on the output side. This is also why you send `data` to
> the API, never `values`.

</v-click>

---

# Quiz — Question 2 / 3

**A `.refine()` checks that `confirm` equals `password`. The message never shows
up next to the confirmation field. Why?**

- **A.** `.refine()` cannot compare two fields — use `.superRefine()`
- **B.** VeeValidate ignores refinements
- **C.** The two fields must be in a nested object
- **D.** The refinement has no `path`, so the issue is attached to the form, not
  to a field

<v-click>

> ✅ **D** — An issue with an empty `path` is a form-level error. Add
> `{ path: ['confirm'] }` and the adapter keys it under `confirm`, where
> `errors.confirm` and `<ErrorMessage name="confirm" />` can find it.

</v-click>

---

# Quiz — Question 3 / 3

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
layout: cover
---

# Hands-on

## Workshop 11 - Forms & validation — 60 min
