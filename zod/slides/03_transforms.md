---
layout: cover
---

# 3 - Transforms & refinements

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Turn** strings into the values you work with: `z.coerce`, `.transform()`, `.pipe()`
- **Choose** between `.default()` and `.catch()`
- **Normalise** a value before checking it
- **Write** cross-field rules with `.refine()` and `.superRefine()`, each error
  on the right field
- **Run** an async check without wasting a request on a malformed value
- **Say** both directions of a conversion once, with a **codec**

---

# Parse, don't validate

```ts
// validate: a yes/no answer — the caller still holds a string
if (!/^\d+$/.test(query.page)) throw new Error('bad page');
const page = Number(query.page);           // converted again, somewhere else

// parse: the schema answers with the value you need
const { page } = z.object({
  page: z.coerce.number().int().min(1).default(1),
}).parse(query);                           // page: number, ≥ 1, an integer
```

- A validator **forgets** what it learned; a parser **returns** it, typed
- Conversion, normalisation and defaults move **into the schema** — one place,
  at the boundary, instead of scattered through the code that reads the value

---

# Coercion

```ts
z.coerce.number().parse('42');        // 42
z.coerce.number().parse('');          // 0           ⚠ Number('') is 0
z.coerce.number().parse('abc');       // ✘ NaN is rejected
z.coerce.boolean().parse('false');    // true        ⚠ Boolean('false') is true
z.coerce.date().parse('2026-11-14');  // Date

z.stringbool().parse('false');        // false — 'true'/'1'/'yes'/'on' and their opposites
```

- `z.coerce.X()` runs the JavaScript constructor (`Number(…)`, `Boolean(…)`) on
  the input, **then** checks the result
- Perfect for query strings, form fields, environment variables — all strings
- `z.coerce.boolean()` on a string is almost always a bug: use **`z.stringbool()`**
- Its input type is `unknown`: anything goes in, the checks decide

---

# `.transform()` and `.pipe()`

```ts
const Tags = z
  .string()                                              // 1. check the input
  .transform((s) => s.split(',').map((t) => t.trim()).filter(Boolean))   // 2. convert
  .pipe(z.array(z.string().min(2)).max(5));             // 3. check the output

Tags.parse('soul, funk,,');      // ['soul', 'funk']
Tags.parse('a');                 // ✘ path: [0] — too small
```

- `.transform(fn)` changes the value — and the **output type**
- A transform cannot be checked afterwards with `.min()`: **`.pipe()`** hands its
  output to a second schema
- Built-in normalisers run in sequence, **before** the checks that follow them:

```ts
z.string().trim().toLowerCase().pipe(z.email())   // ' Nina@Example.COM ' ✔
z.string().trim().min(2)                          // '  j ' ✘ — trimmed first
```

---

# `.default()` vs `.catch()`

```ts
const Search = z.object({
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(['date', 'price']).catch('date'),
});

Search.parse({});                         // { page: 1, sort: 'date' }
Search.parse({ page: '0' });              // ✘ page too small — still an error
Search.parse({ sort: 'hack' });           // { page: 1, sort: 'date' } — replaced
```

- **`.default(v)`**: the value is **missing** → `v`. A wrong value is still an error
- **`.catch(v)`**: the value is **wrong** (or missing) → `v`. No error, ever
- `.catch()` is for inputs where an error helps nobody: a sort order, a theme, a
  page size in a URL someone shared

---

# `.refine()` — one rule across fields

```ts
const Booking = z
  .object({
    email: z.email(),
    confirmEmail: z.email(),
  })
  .refine((b) => b.email === b.confirmEmail, {
    message: 'The two email addresses do not match',
    path: ['confirmEmail'],          // ← the field the error belongs to
  });
```

- The refinement receives the **parsed** object — typed, coerced, defaulted
- Without `path`, the issue lands at the **root**: no field will ever show it
- Runs only if the object's **types** are right: no comparing a number to `undefined`

---

# `.superRefine()` — several issues in one pass

```ts
const Booking = BookingFields.superRefine((b, ctx) => {
  if (b.tier !== 'backstage') return;

  if (b.quantity > 2) {
    ctx.addIssue({ code: 'custom', path: ['quantity'],
                   message: 'Backstage passes are limited to 2 per order' });
  }
  if (b.promoCode !== undefined) {
    ctx.addIssue({ code: 'custom', path: ['promoCode'],
                   message: 'Promo codes do not apply to backstage passes' });
  }
});
```

- `.refine()` raises **one** issue, decided by a boolean
- `.superRefine()` raises **any number**, each with its own `path` and message —
  the user fixes both fields in one go, not one per submit

---

# Checks do not abort — mind your async ones

```ts
const Username = z.string().min(3).regex(/^[a-z0-9_]+$/)
  .refine(async (u) => !(await isTaken(u)), 'Already taken');

await Username.safeParseAsync('ab');    // ✘ too small — and isTaken('ab') WAS called
Username.parse('nina');                 // ✘ throws: async refinement, use parseAsync
```

- In Zod 4, a failed `.min()` does **not** stop the checks chained after it on
  the same schema: they all run, to report everything at once
- Cheap for a regex — a wasted **request** for an availability check. Put it
  behind a pipe: the second schema only runs if the first one passed

```ts
z.string().min(3).regex(/^[a-z0-9_]+$/)
  .pipe(z.string().refine(async (u) => !(await isTaken(u)), 'Already taken'));
```

> Finer control exists: `{ abort: true }` on a check, `{ when }` on a refinement.

---

# Codecs — both directions, once

```ts
const IsoDateTime = z.codec(z.iso.datetime(), z.date(), {
  decode: (iso) => new Date(iso),           // wire → app
  encode: (date) => date.toISOString(),     // app → wire
});

const ConcertWire = z.object({ id: z.string(), startsAt: IsoDateTime });

const concert = z.decode(ConcertWire, json);      // startsAt: Date
const body = z.encode(ConcertWire, concert);      // startsAt: string — ready to send
```

- A `.transform()` only goes **one way**: sending the value back means a second,
  hand-written conversion — and two places to keep in sync
- A codec checks **both** sides: the ISO string on the way in, the `Date` on the
  way out
- `.parse()` still works on a codec: it decodes

---

# Recap

- **Parse, don't validate**: the schema returns the value you need, typed
- `z.coerce.X()` runs the JS constructor, then checks — mind `Number('')` and
  `Boolean('false')`; use **`z.stringbool()`** for booleans in strings
- `.transform()` converts, `.pipe()` checks what the transform produced;
  `.trim()` / `.toLowerCase()` normalise **before** the checks that follow
- `.default()` replaces a **missing** value; `.catch()` replaces a **wrong** one
- `.refine()` raises one issue, `.superRefine()` several — always with a **`path`**
- Checks do not abort: guard an **async** check behind a `.pipe()`, and parse
  with `parseAsync`
- A **codec** says decode and encode once, and checks both sides

---

# Quiz — Question 1 / 3

**`sort: z.enum(['date', 'price']).X('date')`. A shared URL carries
`?sort=hack`. Which `X` turns it into `'date'` without an error?**

- **A.** `.default`
- **B.** `.catch`
- **C.** `.optional`
- **D.** `.transform`

<v-click>

> ✅ **B** — `.default()` only fills in a **missing** value: `'hack'` would still
> be an error. `.catch()` replaces any value that fails the schema.

</v-click>

---

# Quiz — Question 2 / 3

**A `.refine()` checks that `confirmEmail` equals `email`, without a `path`.
Where does the error show up in a form keyed by field?**

- **A.** Under `confirmEmail`
- **B.** Under `email`
- **C.** Under both fields
- **D.** Under no field: its path is `[]`, the root of the object

<v-click>

> ✅ **D** — Zod cannot guess which field is at fault. Add
> `path: ['confirmEmail']` and the issue lands where the user has to fix it.

</v-click>

---

# Quiz — Question 3 / 3

**`z.string().min(3).refine(async (u) => !(await isTaken(u)))`. What happens
with `'ab'`?**

- **A.** `.parse('ab')` returns `'ab'`
- **B.** `.safeParseAsync('ab')` fails on `.min(3)`, and `isTaken` is never called
- **C.** `.safeParseAsync('ab')` fails on `.min(3)` — and `isTaken('ab')` is called anyway
- **D.** The schema cannot be built: an async refinement needs `.superRefine()`

<v-click>

> ✅ **C** — In Zod 4, checks on the same schema do not abort each other. Move the
> async check behind a `.pipe()` — or mark the cheap checks `{ abort: true }` —
> to save the request. And `.parse()` would throw: async needs `parseAsync`.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 3 - Transforms & refinements
