---
layout: cover
---

# 11 - Runtime validation

---
src: ../../typescript-common/slides/11_runtime_validation/learning-objectives.md
---

---

# Types do not exist at run time

```tsx
interface Book { id: number; title: string; price: number }

function useBook(id: number) {
  const [book, setBook] = useState<Book>();
  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then((response) => response.json())
      .then((json: Book) => setBook(json));   // ✔ compiles — `json()` returns `any`
  }, [id]);
  return book;
}

<p>{book?.price.toFixed(2)} €</p>   // 💥 TypeError: book.price.toFixed is not a function
                                    //    the API sent "price": "9.99"
```

- The annotation is a **promise** you make to the checker — nobody keeps it
- Type stripping, `tsc`, a bundler: all **erase** `Book` before the code runs
- Whatever crosses a boundary is **`unknown`** until checked:
  `fetch`, `JSON.parse`, `import.meta.env`, `localStorage`, `FormData`, `postMessage`, files

---

# Checking by hand

```tsx
function parseBook(input: unknown): Book {
  if (typeof input !== 'object' || input === null) throw new Error('Not an object');
  const { id, title, price } = input as Record<string, unknown>;
  if (typeof id !== 'number' || !Number.isInteger(id)) throw new Error('id');
  if (typeof title !== 'string' || title.trim() === '') throw new Error('title');
  if (typeof price !== 'number' || price < 0) throw new Error('price');
  return { id, title, price };
}
```

- It works — chapter 4 did exactly this, and `useBook` can call it on `json`
- But the **type** and the **checks** are written twice, and drift apart
- One error at a time, no path, no message to show the user in the component

> Write the rules **once**, and get the type from them.

---

# A schema

```tsx
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

function BookCard({ book }: { book: Book }) { /* … */ }   // the props, from the schema
```

- A schema is a **value** — it exists at run time — and it **carries** a type
- `z.infer` reads that type: one source of truth — for the hook and for the props
- Zod 4: string formats are top-level — `z.email()`, `z.url()`, `z.uuid()`,
  `z.iso.date()`, `z.int()`

---

# `parse` or `safeParse`

```tsx
const book = BookSchema.parse(json);       // Book — or throws a ZodError

const [result, setResult] = useState<z.ZodSafeParseResult<Book>>();
// … in the effect: .then((json: unknown) => setResult(BookSchema.safeParse(json)))

if (!result) return <p>Loading…</p>;
if (result.success) return <BookCard book={result.data} />;   // Book
result.error.issues;    // [{ path: ['price'], code: 'too_small', message: '…' }, …]
return <pre role="alert">{z.prettifyError(result.error)}</pre>;
// ✖ Too small: expected number to be >=0
//   → at price
```

- `safeParse` returns a **discriminated union** on `success` — chapter 4 again
- **Every** issue is reported, each with its **path**
- Unknown keys are **dropped** from the output: `z.strictObject` refuses them,
  `z.looseObject` keeps them

---

# Transform and coerce

```tsx
const BookSchema = z.object({
  publishedAt: z.iso.date().transform((date) => new Date(date)),
  title: z.string().trim(),
});

type BookJson = z.input<typeof BookSchema>;    // { publishedAt: string; title: string }
type Book = z.output<typeof BookSchema>;       // { publishedAt: Date;   title: string }
// z.infer is z.output
```

```tsx
const OrderSchema = z.object({                   // <form action={…}>: FormData, strings only
  quantity: z.coerce.number().int().default(1),  // "8" → 8, missing → 1
  giftWrap: z.stringbool().default(false),       // a ticked checkbox: "on" → true
});
const order = OrderSchema.parse(Object.fromEntries(formData));
```

- A schema can **reshape** what it checks: parse, don't validate
- ⚠️ `z.coerce.boolean()` is `Boolean(value)`: `"false"` becomes `true`

---

# Branded types

```tsx
const Isbn = z.string().regex(/^\d{13}$/).brand<'Isbn'>();
type Isbn = z.infer<typeof Isbn>;     // string & z.$brand<'Isbn'>

function BookLink({ isbn }: { isbn: Isbn }) {
  return <a href={`/books/${isbn}`}>{isbn}</a>;
}

<BookLink isbn="9780441172719" />;
// ✘ Type 'string' is not assignable to type 'string & $brand<"Isbn">'
<BookLink isbn={Isbn.parse('9780441172719')} />;   // ✔
```

- The branded types of chapter 7 — but now the **only** way to get one is to
  pass the check
- A component that takes an `Isbn` never has to check it again

---

# Standard Schema

```tsx
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

```tsx
import type { StandardSchemaV1 } from '@standard-schema/spec';

export function useFetch<S extends StandardSchemaV1>(url: string, schema: S) {
  const [data, setData] = useState<StandardSchemaV1.InferOutput<S>>();
  useEffect(() => {
    fetch(url).then((response) => response.json()).then(async (json: unknown) => {
      const result = await schema['~standard'].validate(json);
      if (result.issues) throw new ValidationError(result.issues);
      setData(result.value);
    });
  }, [url, schema]);
  return data;
}

const book = useFetch('/api/books/1', BookSchema);    // Book | undefined — a Zod schema
const user = useFetch('/api/me', UserSchema);        // a Valibot one: v.object({ … })
```

- Your hook depends on an **interface**, not on a library
- `validate` may answer in a `Promise`: always `await` it — and declare the
  schema **outside** the component, or the effect runs again on every render

---
src: ../../typescript-common/slides/11_runtime_validation/where-to-validate.md
---

---
src: ../../typescript-common/slides/11_runtime_validation/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 11 - Runtime validation
