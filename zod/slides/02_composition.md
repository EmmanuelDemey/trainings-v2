---
layout: cover
---

# 2 - Composing schemas

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Derive** the bodies of an API from one schema with `.omit()`, `.pick()`,
  `.partial()` and `.extend()` — without copying a field
- **Spot** what `.partial()` does to a field that has a `.default()`
- **Model** "one of several shapes" with a **discriminated union**
- **Use** an enum as the key of a record, exhaustive or partial
- **Write** a recursive schema, and a **branded** type

---

# One schema, many bodies

```ts
const ConcertSchema = z.object({
  id: z.uuid(),
  artist: z.string().min(1),
  startsAt: z.iso.datetime(),
  price: z.number().nonnegative(),
  tags: z.array(z.string()).default([]),
});

const NewConcert = ConcertSchema.omit({ id: true });              // POST /concerts
const ConcertSummary = ConcertSchema.pick({ id: true, artist: true });   // the agenda
const ConcertPatch = NewConcert.partial();                       // PATCH /concerts/:id
const PublishedConcert = ConcertSchema.extend({                  // + new fields
  publishedAt: z.iso.datetime(),
});
```

- Each one is a **new** schema: the original is never mutated
- Add a field to `ConcertSchema`: every derived body gets it, with its rules
- `.extend()` **overrides** a key that already exists — keep that in mind

---

# The `.partial()` trap

```ts
const ConcertPatch = NewConcert.partial();

ConcertPatch.parse({});
// → { tags: [] }           😱 not {}
```

- `.partial()` makes each field optional — but a missing field with a
  `.default()` **still gets its default**
- Applied to the stored concert, an empty `PATCH` **wipes its tags**
- Redeclare those fields without the default:

```ts
const ConcertPatch = NewConcert.partial().extend({
  tags: z.array(z.string()).optional(),
});

ConcertPatch.parse({});   // → {}
```

> Rule of thumb: defaults belong to **creation**, never to an update.

---

# Unions — and why they talk too much

```ts
const Card = z.object({ method: z.literal('card'), last4: z.string().regex(/^\d{4}$/) });
const Paypal = z.object({ method: z.literal('paypal'), email: z.email() });

const Payment = z.union([Card, Paypal]);

Payment.safeParse({ method: 'cash' }).error.issues;
// [{ code: 'invalid_union', path: [], errors: [[…card issues…], […paypal issues…]] }]
```

- A `z.union` tries **each option in order** and returns the first that passes
- When none does, the error says "none of them" — at the **root**, with every
  option's own failures nested inside
- Good for `z.union([z.string(), z.number()])`. Not for tagged objects

---

# Discriminated unions

```ts
const Payment = z.discriminatedUnion('method', [Card, Paypal, Voucher]);

Payment.safeParse({ method: 'cash' }).error.issues;
// [{ code: 'invalid_union', path: ['method'],
//    message: "Invalid discriminator value. Expected 'card' | 'paypal' | 'voucher'" }]

Payment.safeParse({ method: 'card', last4: '42' }).error.issues;
// [{ path: ['last4'], … }]          ← only the card's fields
```

- Zod reads the **discriminator** first, then validates **one** option: errors
  that talk about what this payload is missing, and a faster parse
- The inferred type is a TypeScript **discriminated union**: a `switch` on
  `payment.method` narrows each branch

```ts
switch (payment.method) {
  case 'card':   return `Card ending in ${payment.last4}`;   // payment: Card
  case 'paypal': return `PayPal (${payment.email})`;         // payment: Paypal
}
```

---

# Enums

```ts
const Tier = z.enum(['standard', 'vip', 'backstage']);
type Tier = z.infer<typeof Tier>;            // 'standard' | 'vip' | 'backstage'

Tier.options;                                // ['standard', 'vip', 'backstage']
Tier.enum.vip;                               // 'vip' — autocompleted
Tier.exclude(['backstage']);                 // z.enum(['standard', 'vip'])
Tier.extract(['vip']);                       // z.enum(['vip'])

z.enum(Status);                              // a TypeScript `enum` works too
```

- `options` is the list you render in a `<select>` — from the schema, not a copy
- `exclude` / `extract` derive sub-sets: the tiers sold online, the ones on sale

---

# Records — keyed by an enum

```ts
const Prices = z.record(Tier, z.number().positive());

Prices.parse({ standard: 40, vip: 90 });
// ✘ path: ['backstage'] — Invalid input: expected number, received undefined
Prices.parse({ standard: 40, vip: 90, backstage: 250, gold: 500 });
// ✘ unknown key 'gold'

const Discounts = z.partialRecord(Tier, z.number().min(0).max(1));
Discounts.parse({ vip: 0.2 });               // ✔ — keys checked, each optional
```

- With an **enum** key, `z.record` is **exhaustive**: every tier, no other —
  `Record<Tier, number>`, enforced at run time
- `z.partialRecord`: same keys, any of them missing — `Partial<Record<Tier, number>>`
- `z.record(z.string(), …)` for an open dictionary

> Changed in Zod 4: Zod 3's `z.record(enum, …)` was always partial.

---

# Recursive schemas — the getter

```ts
const Genre = z.object({
  name: z.string(),
  get subgenres() {
    return z.array(Genre);
  },
});

type Genre = z.infer<typeof Genre>;
//   { name: string; subgenres: Genre[] }     ← inferred, recursion included
```

- The getter defers the reference: `Genre` is only read once the constant exists
- No hand-written interface, no `z.lazy()` — and errors keep their full path:
  `['subgenres', 0, 'subgenres', 0, 'name']`
- Works for mutually recursive schemas too: `User.posts` ↔ `Post.author`

---

# Branded types

```ts
const ConcertId = z.uuid().brand<'ConcertId'>();
type ConcertId = z.infer<typeof ConcertId>;      // string & { [brand]: 'ConcertId' }

function cancel(id: ConcertId) { /* … */ }

cancel('7a1b2c3d-…');                    // ✘ compile error: a plain string
cancel(ConcertId.parse(params.id));      // ✔ only a parsed value has the brand
const artistId = ArtistId.parse(x);
cancel(artistId);                        // ✘ compile error: wrong brand
```

- A brand exists in the **type** only — nothing changes at run time
- It proves a value **went through** the schema: two `string`s that are not
  interchangeable can no longer be swapped by mistake

---

# Recap

- **One** source schema; every body derived with `.omit()`, `.pick()`,
  `.partial()`, `.extend()` — nothing copied
- `.partial()` keeps the **defaults**: an empty `PATCH` is not `{}` until you
  redeclare those fields
- `z.union` tries each option, and reports at the root; **`z.discriminatedUnion`**
  reads the tag first, reports on the right field, and types a `switch`
- `z.enum` gives you `.options`, `.enum`, `.exclude()`, `.extract()`
- `z.record(enum, …)` is **exhaustive** in Zod 4; `z.partialRecord` is not
- A **getter** makes a schema recursive, type included
- **`.brand()`** marks a value that went through a schema

---

# Quiz — Question 1 / 3

**`Patch = ConcertSchema.partial()`, and `tags` has `.default([])`. What does
`Patch.parse({})` return?**

- **A.** `{}`
- **B.** `{ tags: [] }`
- **C.** `{ tags: undefined }`
- **D.** It throws: `tags` is required

<v-click>

> ✅ **B** — `.partial()` makes `tags` optional, but a missing value still gets
> its default. Saved as is, the patch wipes the concert's tags. Redeclare
> `tags` without a default with `.extend()`.

</v-click>

---

# Quiz — Question 2 / 3

**Why prefer `z.discriminatedUnion('method', […])` over `z.union([…])` for
payments?**

- **A.** `z.union` cannot hold objects
- **B.** It reads `method` first: errors about the chosen method only, on the
  right path — and a type that narrows in a `switch`
- **C.** `z.union` does not infer a TypeScript type
- **D.** `z.discriminatedUnion` accepts a payment with no `method`

<v-click>

> ✅ **B** — A plain union tries every option and, when all fail, reports one
> root-level `invalid_union`. The discriminated union knows which option the
> payload meant, so its errors talk about **that** option. Both infer the same
> union type.

</v-click>

---

# Quiz — Question 3 / 3

**`const Prices = z.record(z.enum(['standard', 'vip']), z.number())`. Which
payload passes?**

- **A.** `{}`
- **B.** `{ standard: 40 }`
- **C.** `{ standard: 40, vip: 90 }`
- **D.** `{ standard: 40, vip: 90, gold: 200 }`

<v-click>

> ✅ **C** — With an enum key, `z.record` is **exhaustive** in Zod 4: every key,
> and no other. For "some of these keys", that is `z.partialRecord`.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 2 - Composing schemas
