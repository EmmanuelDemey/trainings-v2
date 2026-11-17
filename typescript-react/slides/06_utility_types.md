---
layout: cover
---

# 6 - Utility types

---
src: ../../typescript-common/slides/06_utility_types/learning-objectives.md
---

---

# One model, many shapes

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

// <UserForm /> — no id yet
interface UserFormValues { name: string; email: string; age?: number }
// The draft of a form being edited — any field, each optional
interface UserDraft { name?: string; email?: string; age?: number }
// <UserCard /> in the list view
interface UserCardProps { id: string; name: string }
```

- Four declarations of the **same** fields — add `phone` to `User`, and three
  others silently drift
- Utility types **compute** these shapes from `User`: written once, always in sync

---

# `Partial` and `Required`

```tsx
const [draft, setDraft] = useState<Partial<User>>({});
/* draft: {
  id?: string;
  name?: string;
  email?: string;
  age?: number;
} */

function UserProfile({ user }: { user: Required<User> }) { /* … */ }
/* user: {
  id: string;
  name: string;
  email: string;
  age: number;        ← no longer optional
} */
```

- `Partial<T>` makes **every** property optional — a form draft, a patch, options
- `Required<T>` makes **every** property required — the shape once defaults are applied

---

# `Pick` and `Omit`

```tsx
type UserCardProps = Pick<User, 'id' | 'name'>;
// { id: string; name: string }

type UserFormValues = Omit<User, 'id'>;
// { name: string; email: string; age?: number }

type SubmitButtonProps = Omit<ComponentProps<'button'>, 'type'>;
function SubmitButton(props: SubmitButtonProps) {
  return <button {...props} type="submit" />;   // the wrapper owns `type`
}
```

- `Pick<T, K>` keeps the keys listed; `K` must be keys of `T`
- `Omit<T, K>` removes them — and does **not** check `K`: `Omit<ComponentProps<'button'>, 'tpye'>`
  compiles, and removes nothing
- Utility types **compose**: `Omit<ComponentProps<…>, …>` reads inside out

---

# `Readonly` and `Record`

```tsx
function UserCard({ user }: { user: Readonly<User> }) {
  user.name = 'Grace';   // ✘ Cannot assign to 'name' because it is a read-only property
  return <h2>{user.name}</h2>;
}

type Variant = 'primary' | 'secondary' | 'danger';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-100',
};   // ✘ Property 'danger' is missing
```

- `Readonly<T>` is **shallow**: `user.address.city = '…'` still compiles
- `Record<K, V>` has exactly the keys of `K`, all required — **exhaustive** by construction
- `Record<string, V>` is a dictionary; `Partial<Record<Variant, V>>` allows gaps

---

# Filtering unions

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type SafeVariant = Exclude<ButtonVariant, 'danger'>;
// 'primary' | 'secondary' | 'ghost'

type FilledVariant = Extract<ButtonVariant, 'primary' | 'danger' | 'link'>;
// 'primary' | 'danger'

type MaybeInput = HTMLInputElement | null;   // what a ref holds
type Input = NonNullable<MaybeInput>;
// HTMLInputElement
```

- `Exclude<U, X>` drops the members of `U` assignable to `X`
- `Extract<U, X>` keeps them — useful to intersect two unions
- `NonNullable<T>` drops `null` and `undefined`
- They work **member by member**: chapter 7 shows how

---

# From values to types — `typeof`

```tsx
const defaultFilters = {
  pageSize: 20,
  sortBy: 'name',
};
type Filters = typeof defaultFilters;
// { pageSize: number; sortBy: string }

const SIZES = ['sm', 'md', 'lg'] as const;
type Sizes = typeof SIZES;            // readonly ['sm', 'md', 'lg']
type Size = (typeof SIZES)[number];   // 'sm' | 'md' | 'lg'
```

- In a **type** position, `typeof x` is the type of the value `x`
- `as const` keeps the literals, and makes the array a readonly tuple
- One array gives **both** the runtime list (for a `<select>`, a validation)
  and the type

---

# `keyof` and indexed access

```tsx
type UserKey = keyof User;          // 'id' | 'name' | 'email' | 'age'
type Email = User['email'];         // string
type Age = User['age'];             // number | undefined
type Contact = User['name' | 'email'];   // string
type AnyValue = User[keyof User];   // string | number | undefined

type OnClick = ComponentProps<'button'>['onClick'];
type Line = CartProps['lines'][number];    // the type of one element
```

- `keyof T` is the union of the keys
- `T[K]` reads the type of a property — with a union `K`, the union of the types
- `[number]` reads the element type of an array or a tuple

---

# Functions: `ReturnType`, `Parameters`, `Awaited`

```tsx
async function userLoader(id: string, options?: { signal?: AbortSignal }) {
  // …
  return { id, name: 'Ada', roles: ['admin'] };
}

type LoaderArgs = Parameters<typeof userLoader>;
// [id: string, options?: { signal?: AbortSignal }]

type LoaderResult = ReturnType<typeof userLoader>;
// Promise<{ id: string; name: string; roles: string[] }>

type LoaderData = Awaited<ReturnType<typeof userLoader>>;
// { id: string; name: string; roles: string[] }
```

- `ReturnType<typeof userLoader>` — not `ReturnType<userLoader>`: `userLoader` is a value
- `Awaited<T>` unwraps a promise — recursively: `Awaited<Promise<Promise<number>>>` is `number`
- Handy for a hook or a loader whose result type is not exported:
  `type Cart = ReturnType<typeof useCart>`

---

# `Awaited` and `Promise.all`

```tsx
async function loadDashboard(userId: string) {
  return Promise.all([fetchUser(userId), fetchOrders(userId), 42]);
}
type DashboardData = Awaited<ReturnType<typeof loadDashboard>>;
// [User, Order[], number]

function Dashboard({ data }: { data: Promise<DashboardData> }) {
  const [user, orders] = use(data);
  // user: User · orders: Order[] — one type per position, not (User | Order[])[]
}

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
That is why the destructured variables keep their own types — and why
`use(data)` in the component gets a tuple, not an array of a union.
-->

---

# Classes: `InstanceType`

```tsx
class CartStore {
  constructor(private readonly api: ApiClient) {}
  load() { /* … */ }
}

type Store = InstanceType<typeof CartStore>;   // CartStore
type StoreArgs = ConstructorParameters<typeof CartStore>;   // [api: ApiClient]

function useService<C extends new (...args: any[]) => unknown>(Ctor: C): InstanceType<C> {
  const [service] = useState(() => new Ctor(apiClient) as InstanceType<C>);
  return service;
}
```

- `typeof CartStore` is the type of the **constructor** — the class itself
- `InstanceType` gives the type of what `new` builds
- Mostly met in factories and dependency injection — `useService(CartStore)` is a `CartStore`

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
