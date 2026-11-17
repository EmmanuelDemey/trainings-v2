---
layout: cover
---

# 5 - Generics

---
src: ../../typescript-common/slides/05_generics/learning-objectives.md
---

---

# The problem: one function, many types

```tsx
function UserList({ users }: { users: User[] }) {
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
function ProductList({ products }: { products: Product[] }) {
  return <ul>{products.map((p) => <li key={p.sku}>{p.label}</li>)}</ul>;
}

function List({ items, renderItem }: { items: any[]; renderItem: (item: any) => ReactNode }) {
  return <ul>{items.map(renderItem)}</ul>;      // one component… and no type left
}

<List items={users} renderItem={(user) => user.nmae} />   // any — compiles, renders nothing
```

- Copying the component for each type does not scale
- `any` scales, but **throws the type away**: the caller gets nothing back
- What we want: "whatever type goes in, the **same** type comes out"

---

# A type parameter

```tsx
interface ListProps<T> {
  items: readonly T[];
  renderItem: (item: T) => ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}

<List<number> items={[1, 2, 3]} renderItem={(n) => n.toFixed(2)} />
<List items={['a', 'b']} renderItem={(s) => s.toUpperCase()} />   // T = string, inferred
<List items={users} renderItem={(user) => user.name} />            // T = User
```

- `<T>` declares a **type parameter**: a variable whose value is a type
- The caller can pass the **type argument** explicitly — `<List<number> … />`
- Most of the time, TypeScript **infers** it from the props: let it
- One letter by convention (`T`, `K`, `V`); a real name when there are several:
  `<TRow, TValue>`

---

# Generics you already use

```tsx
const [user, setUser] = useState<User | null>(null);   // useState<S>
const inputRef = useRef<HTMLInputElement>(null);      // useRef<T>
const ThemeContext = createContext<Theme>('light');   // createContext<T>
const [ids, setIds] = useState([1, 2, 3]);             // number[], inferred

type Props = PropsWithChildren<{ title: string }>;
const onSubmit: FormEventHandler<HTMLFormElement> = (event) => { /* … */ };

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();                              // any → T: nobody checked!
}
```

- Hooks, `createContext`, event handler types, `ReactNode` props: all generic
- A generic that only appears in the **return type** (`fetchJson<T>`) is a cast
  in disguise — the data still needs a runtime check

---

# Constraints — `extends`

```tsx
function useLongest<T>(a: T, b: T): T {
  return a.length >= b.length ? a : b;   // ✘ Property 'length' does not exist on type 'T'
}

function useLongest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;   // ✔
}

useLongest('abc', 'de');       // string
useLongest(tags, otherTags);   // string[]
useLongest(10, 20);            // ✘ number has no length
```

- Without a constraint, `T` could be **anything**: you can only do with it what
  you can do with `unknown`
- `T extends X` means "any type, as long as it is assignable to `X`"
- The caller keeps its precise type: `useLongest` returns a `string`, not a `{ length: number }`

---

# `keyof` constraints

```tsx
interface DataTableProps<T, K extends keyof T> {
  rows: readonly T[];
  columns: readonly K[];
  renderCell?: (value: T[K]) => ReactNode;
}

<DataTable rows={users} columns={['name', 'age']} />           // K = 'name' | 'age'
<DataTable rows={users} columns={['role']} renderCell={(role) => <Badge role={role} />} />
// role: 'admin' | 'member'
<DataTable rows={users} columns={['email']} />
// ✘ Type '"email"' is not assignable to type 'keyof User'
```

- `keyof T` is the union of the keys of `T`
- `T[K]` is an **indexed access** type: the type of the value at key `K`
- One type parameter can be **constrained by another**: `K` depends on `T`
- Your editor now **completes** the keys of `columns={['…']}`

---

# Generic interfaces and type aliases

```tsx
interface ApiResponse<T> {
  data: T;
  status: number;
  fetchedAt: Date;
}

type AsyncState<T, E = Error> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

const [users, setUsers] = useState<AsyncState<User[]>>({ status: 'loading' });   // E = Error
const [form, setForm] = useState<AsyncState<User, string[]>>({ status: 'loading' });
```

- An interface or a type alias can take type parameters too
- A type parameter can have a **default**: `E = Error`
- Parameters with a default come **after** the ones without

---

# Generic classes

```tsx
class Store<T> {
  #value: T;
  #listeners = new Set<() => void>();

  constructor(value: T) { this.#value = value; }

  get = (): T => this.#value;
  set = (value: T) => { this.#value = value; this.#listeners.forEach((l) => l()); };
  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => { this.#listeners.delete(listener); };
  };
}

const cart = new Store<CartLine[]>([]);                         // Store<CartLine[]>
const lines = useSyncExternalStore(cart.subscribe, cart.get);    // CartLine[]
```

- The class's type parameter is available to every **instance** member
- A method can declare its **own** type parameters (`select<U>(fn: (value: T) => U)`)
- Static members cannot use `T`: there is one class, many `T`s

---

# A generic repository

```tsx
interface Entity {
  id: string;
}

function useCollection<T extends Entity>(initial: readonly T[] = []) {
  const [items, setItems] = useState<readonly T[]>(initial);

  const save = (entity: T) =>
    setItems((current) => [...current.filter((item) => item.id !== entity.id), entity]);
  const findById = (id: string): T | undefined => items.find((item) => item.id === id);

  return { items, save, findById };
}

const users = useCollection<User>();
const notes = useCollection<{ text: string }>();   // ✘ Property 'id' is missing
```

The constraint is what lets `save` read `entity.id` — for any `T`.

---

# `const` type parameters

```tsx
function defineRoutes<T>(routes: T) { return routes; }
defineRoutes({ home: '/', user: '/users/:id' });
// T = { home: string; user: string } — widened

function defineRoutes<const T>(routes: T) { return routes; }
const routes = defineRoutes({ home: '/', user: '/users/:id' });
// T = { readonly home: '/'; readonly user: '/users/:id' }
<Link to={routes.user} />   // '/users/:id', not string
```

- An object or array literal is **widened** by default: its strings become `string`
- The caller could write `as const` — but they will forget
- `const T` asks TypeScript to infer as if the caller had written `as const`
- A constraint to a primitive — `T extends string` — already keeps the literals
  of a `string[]`: `const` matters for objects, tuples and unconstrained `T`

---

# `NoInfer`

```tsx
function Select<T extends string>(props: { options: readonly T[]; defaultValue: T }) { /* … */ }

<Select options={['light', 'dark']} defaultValue="blue" />
// ✔ compiles! T is inferred from BOTH props: 'light' | 'dark' | 'blue'

function Select<T extends string>(props: { options: readonly T[]; defaultValue: NoInfer<T> }) { /* … */ }

<Select options={['light', 'dark']} defaultValue="blue" />
// ✘ Type '"blue"' is not assignable to type '"dark" | "light"'
```

- Every prop typed with `T` is a **candidate** for its inference
- `NoInfer<T>` (TypeScript 5.4+) marks a position as **checked against** `T`,
  never used to **infer** it
- Typical: a default value, an initial value, a fallback

---

# Good practices

- **Infer, don't annotate**: a JSX writing `<List<User> …>` is often a sign the
  props could infer it
- A type parameter must **relate** two things — two props, or a prop and the
  return type. Used once, it is useless:

```tsx
function Debug<T>({ value }: { value: T }) { return <pre>{JSON.stringify(value)}</pre>; }   // ✘
function Debug({ value }: { value: unknown }) { return <pre>{JSON.stringify(value)}</pre>; } // ✔
```

- Constrain as **little** as needed: `T extends { id: string }`, not `T extends User`
- Prefer `readonly T[]` for props you do not mutate: callers can pass both kinds of array
- Let the linter check the rule: `@typescript-eslint/no-unnecessary-type-parameters`

<!--
"Appears at least twice" counts every place in the signature: props, return
type, constraints of other type parameters. `useFetch<T>(url): T` uses T once:
the lint rule flags it — it is the "cast in disguise" of the earlier slide.
`DataTable<T, K extends keyof T>` is fine: K uses T in its constraint.
In a .tsx file, a generic ARROW component needs a trailing comma —
`<T,>(props: ListProps<T>) => …` — or the parser reads `<T>` as a JSX tag.
-->

---
src: ../../typescript-common/slides/05_generics/quiz.md
---

---

# Quiz — Question 2 / 3

**Why does this not compile?**

```tsx
function Row<T>({ entity }: { entity: T }) {
  return <tr data-id={entity.id} />;
}
```

- **A.** A generic component must annotate its return type
- **B.** `T` is unconstrained: nothing says it has an `id`
- **C.** `T` must be passed explicitly: `<Row<User> entity={user} />`
- **D.** Property access is not allowed on a type parameter

<v-click>

> ✅ **B** — An unconstrained `T` can be **any** type, `number` included. Add
> `T extends { id: string }` and the access is checked — for every possible `T`.

</v-click>

---
src: ../../typescript-common/slides/05_generics/quiz-2.md
---

---
layout: cover
---

# Hands-on

## Workshop 5 - Generics

---
src: ../../typescript-common/slides/retro.md
---
