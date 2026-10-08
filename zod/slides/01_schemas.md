---
layout: cover
---

# 1 - Schemas & types

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** why a TypeScript type says nothing about the data a program
  receives at run time
- **Describe** a payload with `z.object`, the string formats and the number checks
- **Derive** its TypeScript type with `z.infer` — and tell `z.input` from `z.output`
- **Choose** between `parse` and `safeParse`
- **Read** a `ZodError`: one issue per broken rule, each with its `path`

---

# TypeScript stops at the wire

```ts
interface Concert {
  id: string;
  startsAt: string;
  price: number;
}

const response = await fetch('/api/concerts/42');
const concert: Concert = await response.json();   // any → Concert: nobody checked

concert.price.toFixed(2);   // 💥 TypeError at run time, if the API sent "42 €"
```

- Types are **erased** at compile time: nothing of `Concert` exists when the
  JSON arrives
- `response.json()`, `JSON.parse`, `process.env`, `localStorage`, `FormData`,
  `URLSearchParams`, a message from a queue, the output of an LLM — **every
  boundary** hands you `any` or `string`
- The bug does not surface at the boundary: it surfaces **three screens later**

---

# A schema is a value — the type follows

```ts
import * as z from 'zod';

const ConcertSchema = z.object({
  id: z.uuid(),
  startsAt: z.iso.datetime(),
  price: z.number().nonnegative(),
});

type Concert = z.infer<typeof ConcertSchema>;
//   ^? { id: string; startsAt: string; price: number }

const concert = ConcertSchema.parse(await response.json());   // Concert, checked
```

- **One** declaration: the runtime check **and** the static type
- The rules (`uuid`, `nonnegative`) live where the type lives — and can't drift apart
- `import * as z from 'zod'`: Zod 4's recommended import, tree-shaking friendly

---

# The building blocks

```ts
z.string()   z.number()   z.boolean()   z.bigint()   z.date()
z.null()     z.undefined()   z.unknown()   z.never()
z.literal('card')   z.enum(['standard', 'vip'])

z.string().min(1).max(100).regex(/^[A-Z]/).startsWith('FR')
z.number().int().positive().max(10).multipleOf(5)
z.array(z.string()).min(1).max(5)
```

String formats are **top-level** in Zod 4:

```ts
z.email()   z.url()   z.uuid()   z.ipv4()   z.jwt()   z.base64()
z.iso.datetime()   z.iso.date()   z.iso.time()   z.iso.duration()
```

> Zod 3 wrote `z.string().email()`. It still works, deprecated: the top-level
> forms are lighter and carry their own options — `z.url({ protocol: /^https$/ })`.

---

# Objects — and the keys you did not ask for

```ts
const Venue = z.object({ name: z.string(), capacity: z.number() });

Venue.parse({ name: 'La Cigale', capacity: 1400, secret: true });
// → { name: 'La Cigale', capacity: 1400 }           stripped (the default)

z.strictObject({ ... }).parse(...)   // ✘ Unrecognized key: "secret"
z.looseObject({ ... }).parse(...)    // → { ..., secret: true }   kept as is
```

- **Strip** (default): what reaches your app is exactly what you described —
  an internal field leaked by an API never makes it in
- **Strict**: a typo is an error — a back-office form, a config file
- **Loose**: you forward the payload to someone else, untouched

---

# Missing, null, defaulted

```ts
z.object({
  website: z.url().optional(),            // string | undefined — may be absent
  coverUrl: z.url().nullable(),           // string | null — present, maybe null
  subtitle: z.string().nullish(),         // string | null | undefined
  tags: z.array(z.string()).default([]),  // absent → []
  soldOut: z.boolean().default(false),    // absent → false
});
```

- `.default()` fills in a **missing** value (`undefined`), never a wrong one —
  `soldOut: 'yes'` is still an error
- The default is applied **during** the parse: it only exists on the output side

---

# Input vs output

```ts
const ConcertSchema = z.object({
  artist: z.string(),
  tags: z.array(z.string()).default([]),
});

type ConcertInput = z.input<typeof ConcertSchema>;
//   { artist: string; tags?: string[] | undefined }   ← what the API may send

type Concert = z.output<typeof ConcertSchema>;         // = z.infer
//   { artist: string; tags: string[] }                ← what your app gets
```

- A schema has **two** types: what it accepts, and what it produces
- They differ as soon as there is a `.default()`, a coercion or a transform —
  chapter 3 is full of them
- `z.infer` is `z.output`: the side your code works with

---

# `parse` or `safeParse`

```ts
// parse — it throws a ZodError
const concert = ConcertSchema.parse(payload);

// safeParse — it reports
const result = ConcertSchema.safeParse(payload);
if (!result.success) {
  result.error;     // ZodError
  return;
}
result.data;        // Concert — narrowed by the `success` check
```

- **`parse`** when a mismatch is a **bug**: a contract broken by your own API,
  a config file — let it fail loudly
- **`safeParse`** when a mismatch is **expected**: user input, a partner feed
  where one broken entry must not hide the others
- No `try` / `catch` around a `parse`: if you need to catch it, you wanted `safeParse`

---

# Reading a `ZodError`

```ts
const result = ConcertSchema.safeParse({ id: '42', price: -1, venue: { capacity: 0 } });

result.error.issues;
// [
//   { code: 'invalid_format', format: 'uuid', path: ['id'], message: 'Invalid UUID' },
//   { code: 'too_small', minimum: 0, path: ['price'], message: 'Too small: expected number to be >=0' },
//   { code: 'too_small', minimum: 0, path: ['venue', 'capacity'], message: '…' },
// ]
```

- **Every** broken rule, not the first one: Zod does not stop at the first error
- `path` is an **array** — keys and indexes — down to the field at fault
- `code` is stable and machine-readable; `message` is for humans (chapter 4)

---

# Recap

- TypeScript types vanish at run time: **every boundary** of your app hands you
  untyped data
- A Zod schema is a **value** that checks the data, and a **type** you derive
  with `z.infer` — one declaration, no drift
- String formats are **top-level** in Zod 4: `z.email()`, `z.uuid()`, `z.iso.datetime()`
- `z.object` **strips** unknown keys; `z.strictObject` rejects them,
  `z.looseObject` keeps them
- `.default()` only exists on the **output** side: `z.input` ≠ `z.output`
- **`parse`** throws, for bugs; **`safeParse`** reports, for expected failures
- A `ZodError` lists **every** issue, each with its `path`

---

# Quiz — Question 1 / 3

**`const c: Concert = await res.json()` compiles. What did TypeScript check
about `c`?**

- **A.** That the JSON has the fields of `Concert`
- **B.** That the JSON has the fields of `Concert`, in strict mode only
- **C.** Nothing: `res.json()` returns `any`, and `any` is assignable to anything
- **D.** That the response's `Content-Type` is `application/json`

<v-click>

> ✅ **C** — Types are erased at compile time, and `any` switches off the checker.
> The annotation is a **promise** nobody verified. Only a run-time check —
> `ConcertSchema.parse(await res.json())` — turns it into a fact.

</v-click>

---

# Quiz — Question 2 / 3

**A schema has `tags: z.array(z.string()).default([])`. What is the type of
`tags` in `z.input` and in `z.output`?**

- **A.** `string[]` in both
- **B.** `string[] | undefined` in input, `string[]` in output
- **C.** `string[]` in input, `string[] | undefined` in output
- **D.** `unknown` in input, `string[]` in output

<v-click>

> ✅ **B** — The input may omit `tags`; the parse fills in `[]`, so the output
> always has it. That is why a form holds `z.input` and an API call sends
> `z.output`.

</v-click>

---

# Quiz — Question 3 / 3

**A partner feed sends 200 concerts; one has a broken date. Which is right?**

- **A.** `z.array(ConcertSchema).parse(feed)` — the feed is broken, reject it all
- **B.** `safeParse` each entry: keep the 199, log the one with its `path`
- **C.** `ConcertSchema.parse` each entry inside a `try` / `catch`
- **D.** Remove the `startsAt` rule so the feed goes through

<v-click>

> ✅ **B** — A mismatch here is **expected**, not a bug: `safeParse` reports it
> without throwing. **C** works too, but a `try` / `catch` around a `parse` is a
> `safeParse` written the long way. **A** is right only if the business says one
> broken concert invalidates the feed.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 1 - Schemas & types
