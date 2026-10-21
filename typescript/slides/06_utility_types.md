---
layout: cover
---

# 6 - Utility types

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Derive** a type from a value with `typeof`, and from another type with
  `keyof` and indexed access
- **Reshape** an object type with `Partial`, `Required`, `Readonly`, `Pick`,
  `Omit` and `Record`
- **Filter** a union with `Exclude`, `Extract` and `NonNullable`
- **Read** the types of a function or a class with `ReturnType`, `Parameters`,
  `Awaited` and `InstanceType`
- **Keep** a single source of truth for a domain model

---

# One model, many shapes

```ts
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

// POST /users — no id yet
interface CreateUserBody { name: string; email: string; age?: number }
// PATCH /users/:id — any field, each optional
interface UpdateUserBody { name?: string; email?: string; age?: number }
// The list view
interface UserSummary { id: string; name: string }
```

- Four declarations of the **same** fields — add `phone` to `User`, and three
  others silently drift
- Utility types **compute** these shapes from `User`: written once, always in sync

---

# `Partial` and `Required`

```ts
type UpdateUserBody = Partial<User>;
/* {
  id?: string;
  name?: string;
  email?: string;
  age?: number;
} */

type CompleteUser = Required<User>;
/* {
  id: string;
  name: string;
  email: string;
  age: number;        ← no longer optional
} */
```

- `Partial<T>` makes **every** property optional — a patch, a draft, options
- `Required<T>` makes **every** property required — the shape once defaults are applied

---

# `Pick` and `Omit`

```ts
type UserSummary = Pick<User, 'id' | 'name'>;
// { id: string; name: string }

type CreateUserBody = Omit<User, 'id'>;
// { name: string; email: string; age?: number }

type UpdateUserBody = Partial<Omit<User, 'id'>>;
// { name?: string; email?: string; age?: number }
```

- `Pick<T, K>` keeps the keys listed; `K` must be keys of `T`
- `Omit<T, K>` removes them — and does **not** check `K`: `Omit<User, 'idd'>`
  compiles, and removes nothing
- Utility types **compose**: `Partial<Omit<…>>` reads inside out

---

# `Readonly` and `Record`

```ts
type FrozenUser = Readonly<User>;
const user: FrozenUser = await getUser('u1');
user.name = 'Grace';   // ✘ Cannot assign to 'name' because it is a read-only property

type Role = 'admin' | 'member' | 'guest';
type Permissions = Record<Role, string[]>;

const permissions: Permissions = {
  admin: ['read', 'write', 'delete'],
  member: ['read', 'write'],
};   // ✘ Property 'guest' is missing
```

- `Readonly<T>` is **shallow**: `user.address.city = '…'` still compiles
- `Record<K, V>` has exactly the keys of `K`, all required — **exhaustive** by construction
- `Record<string, V>` is a dictionary; `Partial<Record<Role, V>>` allows gaps

---

# Filtering unions

```ts
type Status = 'draft' | 'published' | 'archived' | 'deleted';

type Visible = Exclude<Status, 'deleted'>;
// 'draft' | 'published' | 'archived'

type Final = Extract<Status, 'archived' | 'deleted' | 'unknown'>;
// 'archived' | 'deleted'

type MaybeName = string | null | undefined;
type Name = NonNullable<MaybeName>;
// string
```

- `Exclude<U, X>` drops the members of `U` assignable to `X`
- `Extract<U, X>` keeps them — useful to intersect two unions
- `NonNullable<T>` drops `null` and `undefined`
- They work **member by member**: chapter 7 shows how

---

# From values to types — `typeof`

```ts
const defaultSettings = {
  pageSize: 20,
  theme: 'light',
};
type Settings = typeof defaultSettings;
// { pageSize: number; theme: string }

const ROLES = ['admin', 'member', 'guest'] as const;
type Roles = typeof ROLES;            // readonly ['admin', 'member', 'guest']
type Role = (typeof ROLES)[number];   // 'admin' | 'member' | 'guest'
```

- In a **type** position, `typeof x` is the type of the value `x`
- `as const` keeps the literals, and makes the array a readonly tuple
- One array gives **both** the runtime list (for a `<select>`, a validation)
  and the type

---

# `keyof` and indexed access

```ts
type UserKey = keyof User;          // 'id' | 'name' | 'email' | 'age'
type Email = User['email'];         // string
type Age = User['age'];             // number | undefined
type Contact = User['name' | 'email'];   // string
type AnyValue = User[keyof User];   // string | number | undefined

type Address = Order['customer']['address'];
type Line = Order['lines'][number];        // the type of one element
```

- `keyof T` is the union of the keys
- `T[K]` reads the type of a property — with a union `K`, the union of the types
- `[number]` reads the element type of an array or a tuple

---

# Functions: `ReturnType`, `Parameters`, `Awaited`

```ts
async function fetchUser(id: string, options?: { signal?: AbortSignal }) {
  // …
  return { id, name: 'Ada', roles: ['admin'] };
}

type FetchUserArgs = Parameters<typeof fetchUser>;
// [id: string, options?: { signal?: AbortSignal }]

type FetchUserResult = ReturnType<typeof fetchUser>;
// Promise<{ id: string; name: string; roles: string[] }>

type FetchedUser = Awaited<ReturnType<typeof fetchUser>>;
// { id: string; name: string; roles: string[] }
```

- `ReturnType<typeof fetchUser>` — not `ReturnType<fetchUser>`: `fetchUser` is a value
- `Awaited<T>` unwraps a promise — recursively: `Awaited<Promise<Promise<number>>>` is `number`
- Handy for a library function whose result type is not exported

---

# Classes: `InstanceType`

```ts
class UserService {
  constructor(private readonly http: HttpClient) {}
  findAll() { /* … */ }
}

type Service = InstanceType<typeof UserService>;   // UserService
type ServiceArgs = ConstructorParameters<typeof UserService>;   // [http: HttpClient]

function createService<C extends new (...args: any[]) => unknown>(Ctor: C): InstanceType<C> {
  return new Ctor(httpClient) as InstanceType<C>;
}
```

- `typeof UserService` is the type of the **constructor** — the class itself
- `InstanceType` gives the type of what `new` builds
- Mostly met in factories and dependency injection

---

# The cheat sheet

| Utility | Gives |
|---|---|
| `Partial<T>` / `Required<T>` / `Readonly<T>` | every property optional / required / readonly |
| `Pick<T, K>` / `Omit<T, K>` | only the keys `K` / every key but `K` |
| `Record<K, V>` | one `V` per key of `K` |
| `Exclude<U, X>` / `Extract<U, X>` | the members of `U` not assignable / assignable to `X` |
| `NonNullable<T>` | `T` without `null` and `undefined` |
| `ReturnType<F>` / `Parameters<F>` | the return type / the parameter tuple of a function type |
| `Awaited<T>` | what a promise resolves to |
| `InstanceType<C>` / `ConstructorParameters<C>` | what a constructor builds / takes |

All of them live in `lib.es5.d.ts` — and are written in plain TypeScript.

---

# Quiz — Question 1 / 3

**What is `Partial<Omit<User, 'id'>>`?**

- **A.** A user whose `id` is optional
- **B.** Every field of a user but `id`, each optional
- **C.** Every field of a user, each optional, `id` included
- **D.** A compile error: utility types cannot be nested

<v-click>

> ✅ **B** — Read inside out: `Omit` removes `id`, then `Partial` makes what
> is left optional. That is the body of a PATCH: it can never carry an `id`.

</v-click>

---

# Quiz — Question 2 / 3

**`const SIZES = ['S', 'M', 'L'];` — what is `(typeof SIZES)[number]`?**

- **A.** `'S' | 'M' | 'L'`
- **B.** `string`
- **C.** `number`
- **D.** A compile error

<v-click>

> ✅ **B** — Without `as const`, the array is widened to `string[]`, and its
> elements to `string`. `const SIZES = ['S', 'M', 'L'] as const` gives **A**.

</v-click>

---

# Quiz — Question 3 / 3

**`async function load(): Promise<Config>` — which gives `Config`?**

- **A.** `ReturnType<load>`
- **B.** `ReturnType<typeof load>`
- **C.** `Awaited<ReturnType<typeof load>>`
- **D.** `Awaited<typeof load>`

<v-click>

> ✅ **C** — `load` is a value: its type is `typeof load`. `ReturnType` of it
> is `Promise<Config>`, and `Awaited` unwraps it. **A** does not compile; **B**
> is the promise; **D** leaves the function type as it is.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 6 - Utility types
