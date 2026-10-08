---
layout: cover
---

# 4 - Errors at the boundaries

---

# Learning objectives

At the end of this chapter, you will be able to:

- **List** the boundaries of an application, and put a schema on each one
- **Format** a `ZodError` for its reader: `z.prettifyError`, `z.flattenError`,
  `z.treeifyError`
- **Customise** messages with the `error` param, and translate them with `z.config`
- **Parse** the environment once, at start-up
- **Check** an API response before anyone uses it
- **Map** issues onto the fields of a form, by their `path`

---

# Where the schemas go

```
          ┌────────────────────── your app ───────────────────────┐
env ─────▶│ loadConfig()                                          │
HTTP in ─▶│ route handler: body, params, query                    │
HTTP out ◀│ fetchJson(url, Schema) ◀── a partner API              │
form ────▶│ submit handler                                        │
storage ─▶│ localStorage / a queue / a file / an LLM's output     │
          │                                                       │
          │      inside: typed values only — no more checks       │
          └───────────────────────────────────────────────────────┘
```

- Validate **at the edge**, once — not in every function that reads the data
- Inside, the types are **true**: they were checked on the way in
- A schema at a boundary is also its **documentation**

---

# Three formats, three readers

```ts
const { error } = OrderSchema.safeParse(input);

z.prettifyError(error);       // for a developer, an operator — a log, a terminal
// ✖ Enter a valid email address
//   → at customer.email
// ✖ At least one ticket
//   → at lines[1].quantity

z.flattenError(error);        // for a flat form — one level of fields
// { formErrors: [], fieldErrors: { customer: ['Enter a valid email address'], lines: ['At least one ticket'] } }

z.treeifyError(error);        // for a nested form — mirrors the shape of the data
// { errors: [], properties: { customer: { errors: [], properties: { email: { errors: […] } } }, … } }
```

- `flattenError` files a nested error under its **top-level** key: fine for a
  flat form, lossy for a nested one
- Need `lines[1].quantity` as a key? Build it from **`issue.path`** — workshop 4

---

# Custom messages — one `error` param

```ts
z.string().min(1, 'Your name is required');                 // a check: string shorthand
z.email({ error: 'Enter a valid email address' });           // a schema: the error param

z.string({
  error: (issue) =>
    issue.input === undefined ? 'This field is required' : 'This field must be text',
});
```

- Zod 4 has **one** way: `error`, a string or a function of the issue. Zod 3's
  `message`, `invalid_type_error`, `required_error` and `errorMap` are gone or
  deprecated
- The function form sees the issue — `code`, `input`, `minimum`… — and may
  return `undefined` to fall back to the default message

---

# Messages in another language

```ts
import * as z from 'zod';

z.config(z.locales.fr());

z.string().safeParse(42).error.issues[0].message;
// 'Entrée invalide : chaîne de caractères attendu, nombre reçu'
```

- Zod ships **locales** for the default messages: `fr`, `de`, `es`, `ja`…
- `z.config` is **global**: call it once, at start-up
- Your own messages (`error: '…'`) are **never** translated — they win over
  the locale. For a multilingual app, return a translation **key** from `error`
- Precedence: the schema's `error` → a per-parse `error` (`.parse(x, { error })`) →
  the global one set with `z.config`

---

# The environment — parsed once, at start-up

```ts
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  FEATURE_NEW_CHECKOUT: z.stringbool().default(false),
});

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  console.error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  process.exit(1);
}
export const config = result.data;    // config.PORT: number — process.env.PORT: string | undefined
```

- **Fail fast**: a server that boots with a broken config fails later, at 3 a.m.,
  on the first request that needs the missing variable
- **Every** problem at once: the operator fixes the deployment in one round

---

# API responses — trust, but verify

```ts
type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: 'http'; status: number }
  | { ok: false; kind: 'contract'; message: string };

async function fetchJson<S extends z.ZodType>(url: string, schema: S): Promise<FetchResult<z.output<S>>> {
  const response = await fetch(url);
  if (!response.ok) return { ok: false, kind: 'http', status: response.status };

  const result = schema.safeParse(await response.json());
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, kind: 'contract', message: z.prettifyError(result.error) };
}
```

- A **contract** failure is not an HTTP failure: the server said `200`, and lied.
  Log it loudly — it is the other team's breaking change, caught at the door
- `z.output<S>`: the caller gets the schema's type, no cast

---

# Forms — errors go on the fields

```ts
// issue.path ['lines', 1, 'quantity'] → 'lines[1].quantity'
function toFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    errors[pathToKey(issue.path)] ??= issue.message;     // first message per field
  }
  return errors;
}
```

- The **path** is the contract: the same key for the input, its error, and the
  `422` your API sends back
- Same schema on both sides of the wire → the server's `issue.path` lands on the
  client's field for free
- Form libraries do this for you: `@hookform/resolvers/zod`, `@vee-validate/zod`,
  TanStack Form — Zod 4 speaks **Standard Schema**, so many need no adapter at all

---

# The schema as a contract

```ts
z.toJSONSchema(OrderSchema);
// { type: 'object', properties: { customer: { … }, lines: { type: 'array', minItems: 1, … } },
//   required: ['customer', 'lines'], additionalProperties: false }

const Order = OrderSchema.meta({ title: 'Order', description: 'An order of the shop' });
```

- **JSON Schema** out of the box: OpenAPI docs, an LLM's structured output, a
  form generator, another language's validator
- Refinements and transforms do not translate — they are code, not data
- **Standard Schema**: Zod, Valibot, ArkType implement one interface
  (`~standard.validate`) — a library that accepts one accepts them all

---

# Recap

- Validate **at the edges**, once: env, HTTP in and out, forms, storage — inside,
  the types are true
- **`z.prettifyError`** for humans reading a log; `z.flattenError` for a flat form;
  `z.treeifyError` for a nested one; **`issue.path`** for anything else
- One **`error`** param for every custom message; **`z.config(z.locales.fr())`**
  for the default ones — never for yours
- Parse the **environment** at start-up: fail fast, list every problem
- An API response that breaks its schema is a **contract** failure, not an HTTP one
- `z.toJSONSchema` and **Standard Schema** take your schemas beyond Zod

---

# Quiz — Question 1 / 3

**`FEATURE_FLAG=false` in the environment. Which schema reads it as `false`?**

- **A.** `z.boolean()`
- **B.** `z.coerce.boolean()`
- **C.** `z.stringbool()`
- **D.** `z.literal(false)`

<v-click>

> ✅ **C** — The environment only holds strings. `z.boolean()` and
> `z.literal(false)` reject the string `'false'`; `z.coerce.boolean()` runs
> `Boolean('false')`, which is `true`. `z.stringbool()` reads `'false'`, `'0'`,
> `'no'`, `'off'` as `false`.

</v-click>

---

# Quiz — Question 2 / 3

**A nested form shows errors keyed `customer.email`. You use
`z.flattenError(error).fieldErrors`. What do you get for a broken email?**

- **A.** `{ 'customer.email': [...] }`
- **B.** `{ customer: [...] }` — filed under the top-level key
- **C.** `{ email: [...] }`
- **D.** Nothing: `flattenError` ignores nested fields

<v-click>

> ✅ **B** — `flattenError` keeps one level. For a nested form, use
> `z.treeifyError`, or build the key from `issue.path` — `['customer', 'email']`
> → `'customer.email'`.

</v-click>

---

# Quiz — Question 3 / 3

**You call `z.config(z.locales.fr())`. Which message stays in English?**

- **A.** The one of `z.string().safeParse(42)`
- **B.** The one of `z.email().safeParse('nope')`
- **C.** The one of `z.number().min(1).safeParse(0)`
- **D.** The one of `z.string().min(1, 'Your name is required').safeParse('')`

<v-click>

> ✅ **D** — A locale only replaces the **default** messages. A message you wrote
> wins over it, in whatever language you wrote it.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 4 - Errors at the boundaries

---
src: ./shared/retro.md
---
