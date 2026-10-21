---
layout: cover
---

# 5 - Generics

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Write** a generic function, and let TypeScript **infer** its type arguments
- **Constrain** a type parameter with `extends` — and with `keyof`
- **Write** generic interfaces and classes, with **default** type arguments
- **Keep** literal types with a `const` type parameter
- **Stop** an argument from widening an inference with `NoInfer`

---

# The problem: one function, many types

```ts
function firstNumber(items: number[]): number | undefined {
  return items[0];
}
function firstString(items: string[]): string | undefined {
  return items[0];
}

function first(items: any[]): any {   // one function… and no type left
  return items[0];
}

const n = first([1, 2, 3]);   // any — n.toUpperCase() compiles, and crashes
```

- Copying the function for each type does not scale
- `any` scales, but **throws the type away**: the caller gets nothing back
- What we want: "whatever type goes in, the **same** type comes out"

---

# A type parameter

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

const n = first<number>([1, 2, 3]);   // number | undefined
const s = first(['a', 'b']);          // string | undefined — T inferred
const u = first(users);               // User | undefined
```

- `<T>` declares a **type parameter**: a variable whose value is a type
- The caller can pass the **type argument** explicitly — `first<number>(…)`
- Most of the time, TypeScript **infers** it from the arguments: let it
- One letter by convention (`T`, `K`, `V`); a real name when there are several:
  `<TEntity, TId>`

---

# Generics you already use

```ts
const ids: Array<number> = [1, 2, 3];          // same as number[]
const user: Promise<User> = fetchUser('u1');
const cache = new Map<string, User>();
const seen = new Set<string>();

const names = users.map((user) => user.name);    // map<string>, inferred
const adults = users.filter((user) => user.age >= 18);   // User[]

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();                         // any → T: nobody checked!
}
```

- Arrays, promises, `Map`, `Set`, every array method: all generic
- A generic that only appears in the **return type** (`fetchJson<T>`) is a cast
  in disguise — the data still needs a runtime check

---

# Constraints — `extends`

```ts
function longest<T>(a: T, b: T): T {
  return a.length >= b.length ? a : b;   // ✘ Property 'length' does not exist on type 'T'
}

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;   // ✔
}

longest('abc', 'de');       // string
longest([1, 2], [3]);       // number[]
longest(10, 20);            // ✘ number has no length
```

- Without a constraint, `T` could be **anything**: you can only do with it what
  you can do with `unknown`
- `T extends X` means "any type, as long as it is assignable to `X`"
- The caller keeps its precise type: `longest` returns a `string`, not a `{ length: number }`

---

# `keyof` constraints

```ts
function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

pluck(users, 'age');     // number[]
pluck(users, 'role');    // ('admin' | 'member')[]
pluck(users, 'email');   // ✘ '"email"' is not assignable to '"id" | "name" | "role" | "age"'
```

- `keyof T` is the union of the keys of `T`
- `T[K]` is an **indexed access** type: the type of the value at key `K`
- One type parameter can be **constrained by another**: `K` depends on `T`
- Your editor now **completes** the keys of `pluck(users, '…')`

---

# Generic interfaces and type aliases

```ts
interface ApiResponse<T> {
  data: T;
  status: number;
  fetchedAt: Date;
}

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

const response: ApiResponse<User[]> = await getUsers();
const parsed: Result<number> = parsePort('8080');          // E = Error
const checked: Result<User, string[]> = validate(input);
```

- An interface or a type alias can take type parameters too
- A type parameter can have a **default**: `E = Error`
- Parameters with a default come **after** the ones without

---

# Generic classes

```ts
class Box<T> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  get(): T {
    return this.#value;
  }

  map<U>(fn: (value: T) => U): Box<U> {
    return new Box(fn(this.#value));
  }
}

const numberBox = new Box(42);                         // Box<number>
const labelBox = numberBox.map((n) => `#${n}`);        // Box<string>
```

- The class's type parameter is available to every **instance** member
- A method can declare its **own** type parameters (`map<U>`)
- Static members cannot use `T`: there is one class, many `T`s

---

# A generic repository

```ts
interface Entity {
  id: string;
}

class Repository<T extends Entity> {
  readonly #items = new Map<string, T>();

  save(entity: T): T {
    this.#items.set(entity.id, entity);
    return entity;
  }

  findById(id: string): T | undefined {
    return this.#items.get(id);
  }
}

const users = new Repository<User>();
const notes = new Repository<{ text: string }>();   // ✘ Property 'id' is missing
```

The constraint is what lets `save` read `entity.id` — for any `T`.

---

# `const` type parameters

```ts
function defineRoutes<T>(routes: T) { return routes; }
defineRoutes({ home: '/', user: '/users/:id' });
// T = { home: string; user: string } — widened

function defineRoutes<const T>(routes: T) { return routes; }
defineRoutes({ home: '/', user: '/users/:id' });
// T = { readonly home: '/'; readonly user: '/users/:id' }
```

- An object or array literal is **widened** by default: its strings become `string`
- The caller could write `as const` — but they will forget
- `const T` asks TypeScript to infer as if the caller had written `as const`
- A constraint to a primitive — `T extends string` — already keeps the literals
  of a `string[]`: `const` matters for objects, tuples and unconstrained `T`

---

# `NoInfer`

```ts
function createSelect<const T extends string>(options: readonly T[], initial: T) { /* … */ }

createSelect(['light', 'dark'], 'blue');
// ✔ compiles! T is inferred from BOTH arguments: 'light' | 'dark' | 'blue'

function createSelect<const T extends string>(options: readonly T[], initial: NoInfer<T>) { /* … */ }

createSelect(['light', 'dark'], 'blue');
// ✘ Argument of type '"blue"' is not assignable to parameter of type '"light" | "dark"'
```

- Every argument typed with `T` is a **candidate** for its inference
- `NoInfer<T>` (TypeScript 5.4+) marks a position as **checked against** `T`,
  never used to **infer** it
- Typical: a default value, an initial value, a fallback

---

# Good practices

- **Infer, don't annotate**: a caller writing `<User>` is often a sign the
  signature could infer it
- A type parameter must **relate** two things — two parameters, or a parameter
  and the return type. Used once, it is useless:

```ts
function log<T>(value: T): void { console.log(value); }     // ✘ just use unknown
function log(value: unknown): void { console.log(value); }  // ✔
```

- Constrain as **little** as needed: `T extends { id: string }`, not `T extends User`
- Prefer `readonly T[]` for inputs you do not mutate: callers can pass both kinds of array

---

# Quiz — Question 1 / 3

**`function wrap<T>(value: T) { return [value]; }` — what is the type of
`wrap('a')`?**

- **A.** `any[]`
- **B.** `unknown[]`
- **C.** `string[]`
- **D.** `'a'[]`

<v-click>

> ✅ **C** — `T` is inferred from the argument. A string literal passed to a
> plain `T` is **widened** to `string`. With `<const T>`, it would be `'a'[]`.

</v-click>

---

# Quiz — Question 2 / 3

**Why does this not compile?**

```ts
function getId<T>(entity: T) {
  return entity.id;
}
```

- **A.** A generic function must annotate its return type
- **B.** `T` is unconstrained: nothing says it has an `id`
- **C.** `T` must be passed explicitly: `getId<User>(user)`
- **D.** Property access is not allowed on a type parameter

<v-click>

> ✅ **B** — An unconstrained `T` can be **any** type, `number` included. Add
> `T extends { id: string }` and the access is checked — for every possible `T`.

</v-click>

---

# Quiz — Question 3 / 3

**`pick<T extends string>(options: T[], initial: T)` accepts
`pick(['low', 'high'], 'none')` — `T` becomes `'low' | 'high' | 'none'`. What fixes it?**

- **A.** `initial: NoInfer<T>`
- **B.** `<const T extends string>`
- **C.** `initial: string`
- **D.** `options: readonly T[]`

<v-click>

> ✅ **A** — `'none'` takes part in the inference of `T`. `NoInfer<T>` makes
> `T` come from `options` only; `'none'` is then **checked** against
> `'low' | 'high'`, and refused. **B** keeps literals, but `'none'` is one too.
> **C** accepts any string: the very bug.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 5 - Generics

---
src: ./shared/retro.md
---
