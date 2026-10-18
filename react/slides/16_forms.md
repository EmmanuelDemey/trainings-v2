---
layout: cover
---

# 16 - Forms

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Choose** between controlled and uncontrolled inputs, and **explain** what each
  costs
- **Read** a whole form at once with `FormData`
- **Submit** a form with a React 19 **action**: `<form action>`, `useActionState` for the
  result and the errors, `useFormStatus` for the pending state
- **Validate** with a Zod schema, on the client and in the action
- **Build** a rich form with React Hook Form and `zodResolver`
- **Make** errors accessible: labels, `aria-invalid`, `aria-describedby`, focus

---

# Controlled inputs

The value lives in **React state**; the input only displays it.

```tsx
function NameField() {
  const [name, setName] = useState('');

  return (
    <label>
      Name
      <input value={name} onChange={(e) => setName(e.target.value)} />
      {name.length > 20 && <span>That's a long name!</span>}
    </label>
  );
}
```

- ✅ The value is known **at every keystroke**: live validation, formatting, dependent fields
- ✅ The value can be set from code (reset, prefill, "copy the address")
- ❌ One state + one handler per field; one re-render **per keystroke**
- `value` without `onChange` = a read-only input (React warns)

---

# Uncontrolled inputs

The value lives in the **DOM**; React reads it when needed.

```tsx
function NameField() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => alert(`Hello ${inputRef.current?.value}`);

  return (
    <>
      <label htmlFor="name">Name</label>
      <input id="name" defaultValue="Luke" ref={inputRef} />   {/* defaultValue, not value */}
      <button onClick={handleClick}>Greet</button>
    </>
  );
}
```

- ✅ Less code, no re-render while typing — native `required`, `type="email"` still work
- ❌ The value isn't known before you read it: no live feedback for free
- `defaultValue` / `defaultChecked` set the **initial** value only

---

# Controlled or not?

<br />

| | Controlled | Uncontrolled |
|---|---|---|
| Source of truth | React state | the DOM |
| Initial value | `value` | `defaultValue` |
| Re-render on keystroke | yes | no |
| Live validation / formatting | easy | needs a library |
| Reading the values | already in state | `FormData` or refs |

<br />

- Simple forms → **uncontrolled** + `FormData` + an action
- Rich forms (dependent fields, live checks, many fields) → **React Hook Form**: it is
  uncontrolled underneath, with the comfort of a controlled API

---

# `FormData`

A native API that reads **every named field** of a form:

```tsx
function CreatePersonForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();                          // no full page reload
    const formData = new FormData(event.currentTarget);

    formData.get('name');                            // FormDataEntryValue | null
    formData.getAll('films');                        // every checked checkbox "films"
    const values = Object.fromEntries(formData);     // { name: '…', gender: '…' }

    fetch('/api/people', { method: 'POST', body: formData });   // multipart, files included
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" aria-label="Name" required />
      <input name="avatar" type="file" aria-label="Avatar" />
      <button type="submit">Create</button>
    </form>
  );
}
```

- Only fields with a **`name`** are included; values are **strings** (or `File`s)

---

# React 19: `<form action>`

Pass a **function** to `action`: React calls it with the `FormData`.

```tsx
function CreatePersonForm() {
  async function createAction(formData: FormData) {
    await createPerson({ name: String(formData.get('name')) });
  }

  return (
    <form action={createAction}>
      <input name="name" aria-label="Name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

- No `preventDefault`, no `onSubmit`: React handles the submit event
- The function runs in a **transition** (an Action, chapter 13)
- When it succeeds, React **resets** the uncontrolled fields
- `<button formAction={otherAction}>` sends the same form to another action

---

# `useActionState` — the result of the action

```tsx {*}{maxHeight:'400px'}
type State = { error?: string; created?: Person };

async function createAction(previous: State, formData: FormData): Promise<State> {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Name is required' };
  try {
    return { created: await createPerson({ name }) };
  } catch {
    return { error: 'The server refused the person' };
  }
}

function CreatePersonForm() {
  const [state, formAction, isPending] = useActionState(createAction, {});

  return (
    <form action={formAction}>
      <input name="name" aria-label="Name" />
      <button type="submit" disabled={isPending}>Create</button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.created && <p role="status">{state.created.name} was created</p>}
    </form>
  );
}
```

---

# `useFormStatus` — the pending state, anywhere in the form

```tsx
import { useFormStatus } from 'react-dom';

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();          // the status of the PARENT <form>

  return (
    <button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Saving…' : children}
    </button>
  );
}

<form action={formAction}>
  <input name="name" aria-label="Name" />
  <SubmitButton>Create</SubmitButton>
</form>
```

- Must be called in a component **rendered inside** the `<form>` — not in the form's own
  component
- Also returns `data` (the `FormData` being sent), `method` and `action`
- A reusable design-system button that knows when its form is submitting — no props

---

# Validating with Zod

```ts
import { z } from 'zod';

export const personSchema = z.object({
  name: z.string().trim().min(1, { error: 'Name is required' }),
  email: z.email({ error: 'Enter a valid email' }),
  height: z.number({ error: 'Height must be a number' }).int().positive(),
  gender: z.enum(['male', 'female', 'n/a']),
});

export type PersonInput = z.infer<typeof personSchema>;   // the TS type, for free
```

```ts
const result = personSchema.safeParse(data);
if (!result.success) {
  z.flattenError(result.error).fieldErrors;   // { name?: string[], email?: string[], … }
} else {
  result.data;                                // typed PersonInput
}
```

- **One** schema: the TypeScript type, client validation and server validation (Zod 4 API)

---

# An action validated with Zod

```tsx
type State = { errors?: Partial<Record<keyof PersonInput, string[]>>; values?: Record<string, string> };

async function createAction(_: State, formData: FormData): Promise<State> {
  const values = Object.fromEntries(formData) as Record<string, string>;
  const result = personSchema.safeParse({ ...values, height: Number(values.height) });

  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors, values };  // keep what was typed
  }
  await createPerson(result.data);
  return {};
}
```

```tsx
<input name="name" defaultValue={state.values?.name} aria-label="Name" />
{state.errors?.name && <p role="alert">{state.errors.name[0]}</p>}
```

- React **resets** the form after the action: send the values back as `defaultValue`
- Need live validation as the user types? That's where React Hook Form shines

---

# React Hook Form

```shell
npm install react-hook-form zod @hookform/resolvers
```

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function CreatePersonForm({ onCreate }: { onCreate: (p: PersonInput) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(personSchema),       // types the form from the schema
    defaultValues: { name: '', email: '', gender: 'n/a' },
    mode: 'onTouched',                          // validate on blur, then on every change
  });

  return (
    <form onSubmit={handleSubmit(onCreate)} noValidate>   {/* onCreate gets VALID data */}
      <input {...register('name')} aria-label="Name" />
      {errors.name && <p role="alert">{errors.name.message}</p>}
      <input {...register('height', { valueAsNumber: true })} type="number" aria-label="Height" />
      <button type="submit" disabled={isSubmitting}>Create</button>
    </form>
  );
}
```

---

# What `register` and `useForm` give you

- `register('name')` returns `{ name, ref, onChange, onBlur }` — spread it on the input
  - the input stays **uncontrolled**: typing doesn't re-render the form
  - `valueAsNumber` / `valueAsDate` convert the string before validation
- `handleSubmit(onValid)` prevents the default, validates, focuses the first invalid
  field, and only calls `onValid` with **parsed** data
- `formState`: `errors`, `isSubmitting`, `isDirty`, `isValid`, `touchedFields`…
  (read only what you use — it's a subscription proxy)
- `reset(values)`, `setValue('name', 'Luke')`, `watch('gender')`, `trigger('email')`
- `mode`: `'onSubmit'` (default), `'onBlur'`, `'onTouched'`, `'onChange'`, `'all'`

<br />

```ts
setValue('name', 42);         // ❌ compile error: name is a string
errors.bill;                  // ❌ compile error: no such field
```

---

# Server errors and custom inputs

```tsx
const { setError, control, formState: { errors } } = useForm({ resolver: zodResolver(personSchema) });

const onSubmit = handleSubmit(async (data) => {
  const response = await fetch('/api/people', { method: 'POST', body: JSON.stringify(data) });
  if (response.status === 409) {
    setError('name', { message: 'This person already exists' });    // on a field
  } else if (!response.ok) {
    setError('root.server', { message: 'Please try again later' }); // form-level
  }
});

{errors.root?.server && <p role="alert">{errors.root.server.message}</p>}
```

```tsx
// a third-party component that has no ref / native events (date picker, select lib…)
<Controller
  name="gender"
  control={control}
  render={({ field }) => <GenderPicker value={field.value} onChange={field.onChange} />}
/>
```

- `useFieldArray` handles repeated groups (a list of films, of addresses)

---

# Accessible errors

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  {...register('email')}
  aria-invalid={errors.email ? true : false}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert">{errors.email.message}</p>
)}
```

- Every field has a **visible label** (`<label htmlFor>` or wrapping) — a placeholder is not a label
- `aria-invalid` tells assistive tech the field is wrong; `aria-describedby` reads the
  message when the field gets focus
- `role="alert"` announces the message when it appears
- Move the **focus** to the first invalid field (React Hook Form does it by default)
- `useId()` generates unique ids when the field component is reused

---

# Testing a form

```tsx
it('shows an accessible error when the email is invalid', async () => {
  const onCreate = vi.fn();
  render(<CreatePersonForm onCreate={onCreate} />);

  await userEvent.type(screen.getByLabelText('Name'), 'Luke');
  await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
  await userEvent.click(screen.getByRole('button', { name: 'Create' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Enter a valid email');
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  expect(onCreate).not.toHaveBeenCalled();
});
```

- Query by **label** and **role**: if the test can't find the field, a screen reader can't either
- Type, click, assert on what the user sees — the same test works for all three approaches

---

# Which approach?

<br />

| Form | Approach |
|---|---|
| Search box, newsletter, 1–3 fields | uncontrolled + `<form action>` |
| Create / edit with server validation | `useActionState` + `useFormStatus` + Zod |
| Many fields, live validation, dependent fields, arrays | **React Hook Form** + `zodResolver` |
| Inside a React Router route | the route `action` + `<Form>` (chapter 14) |

<br />

- **Formik** and **Yup**, common in older code, are the previous generation: React Hook
  Form re-renders less, Zod infers the types
- In every case: one Zod schema shared by the client and the server

---

# Recap

- **Controlled**: `value` + `onChange`, state is the truth; **uncontrolled**: `defaultValue`,
  the DOM is the truth, read it with `FormData`
- React 19: `<form action={fn}>` calls `fn(formData)` in a transition and resets the form
- `useActionState(action, initial)` → `[state, formAction, isPending]`; the action receives
  `(previousState, formData)` and returns the next state
- `useFormStatus()` gives `pending` to any component **inside** the form
- Zod: one schema → `z.infer` type + `safeParse` + `z.flattenError`
- React Hook Form: `register`, `handleSubmit`, `formState.errors`, `zodResolver`,
  `setError`, `Controller`
- Accessible errors: label, `aria-invalid`, `aria-describedby`, `role="alert"`, focus

---

# Quiz — Question 1 / 3

**Where must `useFormStatus()` be called to know if a form is submitting?**

- **A.** In the component that renders the `<form>`
- **B.** In a component rendered **inside** the `<form>`
- **C.** Anywhere in the app
- **D.** Inside the action function

<v-click>

> ✅ **B** — `useFormStatus` reads the status of its **parent** `<form>`, like a context.
> Called in the component that renders the form, there is no parent form yet: `pending`
> stays `false`. `useActionState`'s `isPending` is the alternative at that level.

</v-click>

---

# Quiz — Question 2 / 3

**With React Hook Form, why doesn't typing in an input re-render the whole form?**

- **A.** It uses `memo` on every input
- **B.** `register` keeps the inputs uncontrolled: values live in the DOM and in refs, not in React state
- **C.** It debounces `setState`
- **D.** It does re-render on every keystroke

<v-click>

> ✅ **B** — `register` attaches a `ref` and native listeners. React re-renders only
> for the `formState` parts you read (e.g. a new error), not for each character typed.

</v-click>

---

# Quiz — Question 3 / 3

**Which markup lets a screen reader announce the error message when the user focuses the invalid field?**

- **A.** A red border on the input
- **B.** `placeholder="Invalid email"`
- **C.** `aria-invalid="true"` and `aria-describedby` pointing to the message's `id`
- **D.** `title="Invalid email"` on the form

<v-click>

> ✅ **C** — `aria-invalid` states that the value is wrong, `aria-describedby` makes the
> message part of the field's description. Color alone and placeholders are not
> accessible.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 16 - Forms: React 19 actions and React Hook Form
