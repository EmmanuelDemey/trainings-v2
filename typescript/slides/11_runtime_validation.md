---
layout: cover
---

# 11 - Runtime validation

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** why a type annotation checks nothing at run time
- **Validate** the data that enters the app with a **Zod** schema
- **Infer** types from a schema — `z.infer`, `z.input`, `z.output` — instead of
  writing them twice
- **Choose** between `parse` and `safeParse`
- **Transform**, **coerce** and **brand** while validating
- **Write** code that accepts any validation library, through **Standard Schema**

---

# Types do not exist at run time

```ts
interface Book { id: number; title: string; price: number }

const response = await fetch('/api/books/1');
const book: Book = await response.json();   // ✔ compiles — `json()` returns `any`

book.price.toFixed(2);   // 💥 TypeError: book.price.toFixed is not a function
                         //    the API sent "price": "9.99"
```

- The annotation is a **promise** you make to the checker — nobody keeps it
- Type stripping, `tsc`, a bundler: all **erase** `Book` before the code runs
- Whatever crosses a boundary is **`unknown`** until checked:
  `fetch`, `JSON.parse`, `process.env`, `localStorage`, form data, messages, files

---

# Checking by hand

```ts
function parseBook(input: unknown): Book {
  if (typeof input !== 'object' || input === null) throw new Error('Not an object');
  const { id, title, price } = input as Record<string, unknown>;
  if (typeof id !== 'number' || !Number.isInteger(id)) throw new Error('id');
  if (typeof title !== 'string' || title.trim() === '') throw new Error('title');
  if (typeof price !== 'number' || price < 0) throw new Error('price');
  return { id, title, price };
}
```

- It works — chapter 4 did exactly this
- But the **type** and the **checks** are written twice, and drift apart
- One error at a time, no path, no message for the user

> Write the rules **once**, and get the type from them.

---

# A schema

```ts
import { z } from 'zod';

const BookSchema = z.object({
  id: z.int().positive(),
  title: z.string().trim().min(1),
  authors: z.array(z.string()).min(1),
  price: z.number().nonnegative(),
  cover: z.url({ protocol: /^https$/ }).optional(),
  format: z.enum(['paperback', 'hardcover', 'ebook']),
});

type Book = z.infer<typeof BookSchema>;
// { id: number; title: string; authors: string[]; price: number;
//   cover?: string | undefined; format: 'paperback' | 'hardcover' | 'ebook' }
```

- A schema is a **value** — it exists at run time — and it **carries** a type
- `z.infer` reads that type: one source of truth
- Zod 4: string formats are top-level — `z.email()`, `z.url()`, `z.uuid()`,
  `z.iso.date()`, `z.int()`

---

# `parse` or `safeParse`

```ts
const book = BookSchema.parse(json);       // Book — or throws a ZodError

const result = BookSchema.safeParse(json);
if (result.success) {
  result.data;            // Book
} else {
  result.error.issues;    // [{ path: ['price'], code: 'too_small', message: '…' }, …]
  z.prettifyError(result.error);
  // ✖ Too small: expected number to be >=0
  //   → at price
}
```

- `safeParse` returns a **discriminated union** on `success` — chapter 4 again
- **Every** issue is reported, each with its **path**
- Unknown keys are **dropped** from the output: `z.strictObject` refuses them,
  `z.looseObject` keeps them

---

# Transform and coerce

```ts
const BookSchema = z.object({
  publishedAt: z.iso.date().transform((date) => new Date(date)),
  title: z.string().trim(),
});

type BookJson = z.input<typeof BookSchema>;    // { publishedAt: string; title: string }
type Book = z.output<typeof BookSchema>;       // { publishedAt: Date;   title: string }
// z.infer is z.output
```

```ts
const Env = z.object({
  PORT: z.coerce.number().int().default(3000),   // "8080" → 8080, missing → 3000
  CACHE: z.stringbool().default(false),          // "true", "yes", "1" → true
});
```

- A schema can **reshape** what it checks: parse, don't validate
- ⚠️ `z.coerce.boolean()` is `Boolean(value)`: `"false"` becomes `true`

---

# Branded types

```ts
const Isbn = z.string().regex(/^\d{13}$/).brand<'Isbn'>();
type Isbn = z.infer<typeof Isbn>;     // string & z.$brand<'Isbn'>

function findByIsbn(isbn: Isbn) { /* … */ }

findByIsbn('9780441172719');                 // ✘ string is not assignable to Isbn
findByIsbn(Isbn.parse('9780441172719'));     // ✔
```

- The branded types of chapter 7 — but now the **only** way to get one is to
  pass the check
- A function that takes an `Isbn` never has to check it again

---

# Standard Schema

```ts
interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;                       // 'zod', 'valibot', 'arktype'…
    readonly validate: (value: unknown) =>
      Result<Output> | Promise<Result<Output>>;    // { value } or { issues }
    readonly types?: { input: Input; output: Output };
  };
}
```

- **One** interface implemented by Zod, Valibot, ArkType, Effect Schema…
- A **type-only** package: `@standard-schema/spec`
- Libraries accept **any** schema: tRPC, TanStack Form & Router, Hono,
  React Hook Form resolvers…

---

# Accepting any schema

```ts
import type { StandardSchemaV1 } from '@standard-schema/spec';

export async function validate<S extends StandardSchemaV1>(
  schema: S,
  input: unknown,
): Promise<StandardSchemaV1.InferOutput<S>> {
  const result = await schema['~standard'].validate(input);
  if (result.issues) throw new ValidationError(result.issues);
  return result.value;
}

const book = await validate(BookSchema, json);        // Book — a Zod schema
const user = await validate(v.object({ … }), json);   // a Valibot one
```

- Your code depends on an **interface**, not on a library
- `validate` may answer in a `Promise`: always `await` it

---

# Where to validate

- At the **edges** — once, where data enters:
  - HTTP responses, request bodies, query strings
  - `process.env`, at start-up: fail **before** serving anything
  - `JSON.parse`, `localStorage`, files, messages from a queue or a worker
  - form data
- **Inside** the app, trust the types: no `parse` deep in the domain
- Zod is not the only one: **Valibot** is tree-shakable (smaller bundles),
  **ArkType** uses TypeScript syntax in strings and is fast
- `z.toJSONSchema(schema)` documents the contract for other teams —
  `{ io: 'input' }` when the schema has a `transform`

---

# Quiz — Question 1 / 3

**`const book: Book = JSON.parse(text)`. What is checked at run time?**

- **A.** Every field of `Book`
- **B.** Only that `text` is valid JSON
- **C.** Only the required fields of `Book`
- **D.** Nothing at all — not even the JSON

<v-click>

> ✅ **B** — `JSON.parse` throws on invalid JSON, and returns `any`. The
> annotation is erased: the shape of the value is never checked. To check it,
> pass it through a schema.

</v-click>

---

# Quiz — Question 2 / 3

**`const S = z.object({ at: z.iso.date().transform((d) => new Date(d)) })`.
What are `z.input<typeof S>['at']` and `z.output<typeof S>['at']`?**

- **A.** `Date` and `Date`
- **B.** `string` and `string`
- **C.** `string` and `Date`
- **D.** `Date` and `string`

<v-click>

> ✅ **C** — The input is what the schema accepts, before the `transform`: a
> string. The output is what `parse` returns: a `Date`. `z.infer` is the output.

</v-click>

---

# Quiz — Question 3 / 3

**A form library accepts a Zod, a Valibot or an ArkType schema. How?**

- **A.** It depends on all three libraries
- **B.** It reads the `~standard` property every one of them implements
- **C.** It converts each schema to JSON Schema first
- **D.** It only checks the types, at compile time

<v-click>

> ✅ **B** — Standard Schema is one interface: `schema['~standard'].validate(value)`
> returns `{ value }` or `{ issues }`, and `InferOutput` gives the type. The
> library depends on a type-only package, not on any validator.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 11 - Runtime validation
