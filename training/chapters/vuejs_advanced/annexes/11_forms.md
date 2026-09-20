---
layout: cover
---

# Annexe — Forms & validation

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

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
- Chapter 6's navigation guards and this chapter's form state meet exactly here
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

# Quiz — Question 1 / 2

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

# Quiz — Question 2 / 2

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

