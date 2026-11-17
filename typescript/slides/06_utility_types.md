---
layout: cover
---

# 6 - Utility types

---
src: ../../typescript-common/slides/06_utility_types/learning-objectives.md
---

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

# `Awaited` and `Promise.all`

```ts
const [user, orders] = await Promise.all([fetchUser('u1'), fetchOrders('u1')]);
// user: User · orders: Order[] — one type per position, not (User | Order[])[]

async function loadDashboard() {
  return Promise.all([fetchUser('u1'), fetchOrders('u1'), 42]);
}
type Dashboard = Awaited<ReturnType<typeof loadDashboard>>;
// [User, Order[], number]

type Mixed = Awaited<number | Promise<string>>;   // number | string
type Tuple = Awaited<[Promise<number>]>;          // [Promise<number>] — not unwrapped
```

- `Promise.all` maps a **tuple** of promises to a tuple of `Awaited` values:
  its signature is `{ -readonly [P in keyof T]: Awaited<T[P]> }`
- `Awaited` is **distributive** on a union, and leaves non-promises as they are
- It unwraps the promise itself, not the promises **inside** a tuple — that is
  `Promise.all`'s job

<!--
Read the signature of Promise.all in lib.es2015.promise.d.ts with the room:
a mapped type over a tuple (chapter 7) that applies Awaited to each element.
That is why the destructured variables keep their own types.
-->

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
src: ../../typescript-common/slides/06_utility_types/the-cheat-sheet.md
---

---
src: ../../typescript-common/slides/06_utility_types/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 6 - Utility types
