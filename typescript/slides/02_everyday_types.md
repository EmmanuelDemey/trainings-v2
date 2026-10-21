---
layout: cover
---

# 2 - Everyday types

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Annotate** variables, arrays, tuples, objects and functions — and know
  when **not** to, because inference does it
- **Choose** between `interface` and `type`
- **Tell apart** `any`, `unknown` and `never`
- **Freeze** a literal with `as const`, and **check** one with `satisfies`
- **Release** a resource with `using`

---

# Declaring variables

```ts
var firstName = 'Manu';    // function-scoped, hoisted: forget it
let lastName = 'Demey';    // block-scoped, reassignable
const age = 42;            // block-scoped, never reassigned
```

- The same keywords as JavaScript: TypeScript adds **types**, not new ways to
  declare
- `const` means **not reassigned**, not **immutable**:

```ts
const user = { firstName: 'Manu' };
user.firstName = 'Emmanuel';   // ✔ compiles — the object is mutable
user = {};                     // ✘ Cannot assign to 'user' because it is a constant
```

---

# Primitives — and inference

```ts
let title: string = 'TypeScript';
let count: number = 42;          // integers and floats alike
let done: boolean = false;
let big: bigint = 9007199254740993n;
let id: symbol = Symbol('id');
let nothing: null = null;
let missing: undefined = undefined;
```

Most of the time, **write none of them**: TypeScript **infers** from the value.

```ts
let title = 'TypeScript';   // string
const count = 42;           // 42 — a const never changes: its type is the literal
title = 42;                 // ✘ Type 'number' is not assignable to type 'string'
```

> Annotate **function signatures** and **exported** values; let inference do the rest.

---

# Arrays and tuples

```ts
const tags: string[] = ['ts', 'js'];
const ids: Array<number> = [1, 2, 3];            // the same thing
const frozen: readonly string[] = ['a', 'b'];    // no push, no splice
frozen.push('c');   // ✘ Property 'push' does not exist on type 'readonly string[]'
```

A **tuple** is an array of a known length, a type per position:

```ts
type Point = [x: number, y: number];             // labels: documentation only
const origin: Point = [0, 0];
const [x, y] = origin;

type HttpResult = [status: number, body: string, headers?: Record<string, string>];
```

- `useState` returns a tuple: `[value, setValue]`
- `Object.entries(o)` gives `[string, T][]`

---

# Object types

```ts
interface Product {
  readonly id: string;     // set once, never reassigned
  name: string;
  price: number;
  discount?: number;       // optional: number | undefined
}

const milk: Product = { id: 'milk', name: 'Milk', price: 129 };
milk.id = 'beer';          // ✘ Cannot assign to 'id' because it is a read-only property
milk.discount?.toFixed(2); // optional chaining: undefined if absent
```

- **Excess property check**: a literal with an unknown key is an error

```ts
const tea: Product = { id: 'tea', name: 'Tea', price: 499, prise: 1 };
// ✘ Object literal may only specify known properties, and 'prise' does not exist
```

---

# `interface` or `type`?

```ts
interface User { name: string; }
interface Admin extends User { rights: string[]; }

type User = { name: string };
type Admin = User & { rights: string[] };

type Id = string | number;                        // only `type` can name a union…
type Pair = [string, number];                     // …a tuple, a primitive, a mapped type
```

| | `interface` | `type` |
|---|---|---|
| Object shapes | ✔ | ✔ |
| Unions, tuples, primitives | ✘ | ✔ |
| `extends` / `implements` | ✔ | `&`, and `implements` on an object type |
| Declared twice → **merged** | ✔ (augmenting a library) | ✘ Duplicate identifier |

> A convention, not a rule: `interface` for object shapes, `type` for the rest.

---

# Functions

```ts
function add(a: number, b: number): number {
  return a + b;
}

const greet = (name: string, greeting = 'Hello'): string => `${greeting} ${name}`;
//                           ^ default value: optional, type inferred

function log(message: string, level?: 'info' | 'error') {}   // optional: string | undefined

function sum(...values: number[]): number {                  // rest: always an array
  return values.reduce((total, value) => total + value, 0);
}

type Comparator<T> = (a: T, b: T) => number;                 // a function type
```

- Parameters are **never** inferred (they are `any`, refused by `strict`)
- Return types are inferred — annotate them on exported functions: the contract
  is then written down, and a wrong `return` is reported **where** it is

---

# Overloads

One function, several **signatures** — when the return type depends on the arguments:

```ts
function find(id: string): Product | undefined;
function find(ids: readonly string[]): Product[];
function find(query: string | readonly string[]): Product | Product[] | undefined {
  return typeof query === 'string'
    ? catalog.find((p) => p.id === query)
    : catalog.filter((p) => query.includes(p.id));
}

find('tea');           // Product | undefined
find(['tea', 'milk']); // Product[]
find(42);              // ✘ No overload matches this call
```

- The **implementation signature** is not visible to callers
- A union parameter is simpler when the return type does **not** change

---

# `any`, `unknown`, `never`

```ts
let a: any = JSON.parse(text);
a.foo.bar();               // ✔ compiles — the checker is off. 💥 at run time

let u: unknown = JSON.parse(text);
u.foo;                     // ✘ 'u' is of type 'unknown'
if (typeof u === 'object' && u !== null && 'foo' in u) u.foo;   // ✔ once checked

function fail(message: string): never {   // never returns
  throw new Error(message);
}
```

| | Accepts | Lets you |
|---|---|---|
| `any` | everything | do anything — **contagious**, switches the checker off |
| `unknown` | everything | do nothing until you **narrow** it |
| `never` | nothing | — the empty type: an impossible case |

> Input you do not control — `JSON.parse`, `fetch`, `catch (e)` — is `unknown`.

---

# `as const`

```ts
const CURRENCIES = ['EUR', 'USD', 'GBP'];             // string[]
const CURRENCIES = ['EUR', 'USD', 'GBP'] as const;    // readonly ['EUR', 'USD', 'GBP']

type Currency = (typeof CURRENCIES)[number];          // 'EUR' | 'USD' | 'GBP'

const config = { retries: 3, mode: 'strict' } as const;
//    { readonly retries: 3; readonly mode: 'strict' }
config.retries = 4;   // ✘ read-only
```

- Every value becomes its **literal** type, every property and array `readonly`
- **One** list — the runtime values — and the type is derived from it: they
  cannot drift apart

---

# `satisfies`

```ts
const SHIPPING: Record<string, number> = { EUR: 490, USD: 590 };
SHIPPING.JPY;            // number — wrong, and silent: the annotation widened the type

const SHIPPING = { EUR: 490, USD: 590, GBP: 450 } satisfies Record<Currency, number>;
SHIPPING.JPY;            // ✘ Property 'JPY' does not exist
// remove GBP            // ✘ Property 'GBP' is missing
```

- An **annotation** replaces the type of the value with the declared one
- **`satisfies`** checks the value against the type, and **keeps** its own,
  more precise type
- Together: `as const satisfies …` — literal **and** checked

---

# `using` — explicit resource management

```ts
function openConnection(): Disposable {
  const connection = db.connect();
  return {
    query: connection.query,
    [Symbol.dispose]() {
      connection.close();
    },
  };
}

{
  using connection = openConnection();
  connection.query('SELECT 1');
}   // ← Symbol.dispose is called here, even if the block threw

await using file = await open('data.json');   // Symbol.asyncDispose, awaited
```

- The `try` / `finally` you would have written, by the language
- ES2026, run natively by Node.js 24 — and by Vitest: `using spy = vi.spyOn(…)`

---

# Quiz — Question 1 / 3

**`const SHIPPING = { EUR: 490 } satisfies Record<string, number>`. What is
the type of `SHIPPING`?**

- **A.** `Record<string, number>`
- **B.** `{ EUR: number }`
- **C.** `{ readonly EUR: 490 }`
- **D.** `any`

<v-click>

> ✅ **B** — `satisfies` **checks** the value, it does not change its type. An
> annotation would have given **A**, and lost the key. **C** needs `as const`.

</v-click>

---

# Quiz — Question 2 / 3

**`function parse(input: unknown) { return input.trim(); }` — what happens?**

- **A.** It compiles: `unknown` accepts anything
- **B.** It compiles, and throws if `input` is not a string
- **C.** ✘ `'input' is of type 'unknown'` — narrow it first
- **D.** It compiles in non-strict mode only

<v-click>

> ✅ **C** — `unknown` **accepts** anything but **allows** nothing. With `any`,
> **B** would happen: it compiles, then crashes at run time.

</v-click>

---

# Quiz — Question 3 / 3

**Which declaration gives `type Currency = 'EUR' | 'USD'` with
`(typeof CURRENCIES)[number]`?**

- **A.** `const CURRENCIES = ['EUR', 'USD'];`
- **B.** `const CURRENCIES: string[] = ['EUR', 'USD'];`
- **C.** `const CURRENCIES = ['EUR', 'USD'] as const;`
- **D.** `let CURRENCIES = ['EUR', 'USD'] as string[];`

<v-click>

> ✅ **C** — Without `as const`, an array literal is widened to `string[]`, and
> `(typeof …)[number]` is `string`. `as const` keeps each element's literal type.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 2 - Everyday types
