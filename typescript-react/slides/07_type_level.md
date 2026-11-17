---
layout: cover
---

# 7 - Type-level programming

---
src: ../../typescript-common/slides/07_type_level/learning-objectives.md
---

---

# Types are a language

```tsx
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Exclude<T, U> = T extends U ? never : T;

// @types/react
type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
  T extends JSXElementConstructor<infer Props> ? Props
  : T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T]
  : {};
```

- The utility types of chapter 6 are written **in TypeScript**, in `lib.es5.d.ts` —
  and so is `ComponentProps`, in `@types/react`
- The type system has loops (mapped types), conditions (conditional types),
  pattern matching (`infer`), strings (template literals) and recursion
- Rarely needed in application code — **often** in libraries, and to **read**
  their error messages

---

# Mapped types

```tsx
type Toggles<T> = {
  [K in keyof T]: boolean;
};

interface Panels {
  filters: ReactNode;
  details: ReactNode;
}

const [open, setOpen] = useState<Toggles<Panels>>({ filters: true, details: false });
// open: { filters: boolean; details: boolean }

type Setters<T> = {
  [K in keyof T]: (value: T[K]) => void;
};
```

- `[K in keyof T]` loops over the keys of `T`
- The value can use `K`, and read `T[K]`
- The loop can run over any union of keys: `[K in 'a' | 'b']`, `[K in Variant]`

---

# Modifiers: `readonly` and `?`

```tsx
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyPartial<T>  = { [K in keyof T]?: T[K] };

type Mutable<T>    = { -readonly [K in keyof T]: T[K] };   // removes readonly
type MyRequired<T> = { [K in keyof T]-?: T[K] };           // removes ?

interface ButtonProps {
  readonly label: string;
  readonly size?: 'sm' | 'lg';
}

type Editable = Mutable<ButtonProps>;     // { label: string; size?: 'sm' | 'lg' }
type Complete = MyRequired<ButtonProps>;  // { readonly label: string; readonly size: 'sm' | 'lg' }
```

- A mapped type over `keyof T` **keeps** the modifiers of `T` — it is *homomorphic*
- `+` (implicit) adds a modifier, `-` removes it

---

# Template literal types

```tsx
type Tone = 'primary' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type ButtonClass = `btn-${Tone}-${Size}`;
// 'btn-primary-sm' | 'btn-primary-md' | … | 'btn-danger-lg' — every combination

type CssVar = `--${string}`;
const accent: CssVar = '--accent';   // ✔ <div style={{ [accent]: '#e11d48' }} />
const broken: CssVar = 'accent';     // ✘

type Handler = `on${Capitalize<'open' | 'close'>}`;   // 'onOpen' | 'onClose'
```

- The same syntax as a JavaScript template string, on **types**
- A union inside expands to **every** combination
- `${number}`, `${string}` match any number or string
- Built-in: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`

---

# Key remapping with `as`

```tsx
interface TodoEvents {
  add: { text: string };
  toggle: { id: string };
  move: { from: number; to: number };
}

type Handlers<T> = {
  [K in keyof T & string as `on${Capitalize<K>}`]: (payload: T[K]) => void;
};

function TodoList(props: { items: Todo[] } & Handlers<TodoEvents>) { /* … */ }

<TodoList
  items={todos}
  onAdd={({ text }) => {}}
  onToggle={({ id }) => {}}
  onMove={({ from, to }) => {}}
/>
```

- `as` **renames** each key — here with a template literal type
- `keyof T & string`: `keyof` may hold `number` and `symbol` keys, which
  `Capitalize` refuses
- Remapping a key to `never` **removes** it

---

# Conditional types

```tsx
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>;   // true
type B = IsString<42>;        // false

type MyNonNullable<T> = T extends null | undefined ? never : T;

type ResultProps<T> = T extends unknown[] ? { items: T; total: number } : { item: T };
type Users = ResultProps<User[]>;   // { items: User[]; total: number } — for <UserList />
type One = ResultProps<User>;       // { item: User } — for <UserDetail />
```

- `A extends B ? X : Y` — "if `A` is assignable to `B`, then `X`, else `Y`"
- A `?:` on **types**: evaluated by the compiler, gone at run time
- `never` is the empty union: returning it **drops** a member

---

# Distributive conditional types

```tsx
type ToArray<T> = T extends unknown ? T[] : never;

type A = ToArray<string | number>;
// string[] | number[]    — NOT (string | number)[]

type MyExclude<T, U> = T extends U ? never : T;
type B = MyExclude<'a' | 'b' | 'c', 'a'>;
// = ('a' extends 'a' ? never : 'a') | ('b' extends 'a' ? never : 'b') | ('c' …)
// = never | 'b' | 'c'  =  'b' | 'c'

type ToArrayAll<T> = [T] extends [unknown] ? T[] : never;
type C = ToArrayAll<string | number>;   // (string | number)[]
```

- On a **naked** type parameter, a conditional type is applied to **each member**
  of a union, and the results are joined back — that is how `Exclude` works
- Wrap both sides in `[ ]` to switch it off

<!--
The React-side consequence: `Omit<A | B, 'x'>` is NOT distributive (Omit is a
mapped type over keyof (A | B) — the common keys only). That is why a
discriminated union of props loses its variants through Omit, and why
libraries write `T extends unknown ? Omit<T, K> : never` ("DistributiveOmit").
-->

---

# `infer` — pattern matching on types

```tsx
type PropsOf<C> = C extends JSXElementConstructor<infer P> ? P : never;
type A = PropsOf<typeof Avatar>;   // { src: string; size?: number }

type StateOf<H> = H extends () => [infer S, unknown] ? S : never;
type B = StateOf<typeof useCounter>;   // number — useCounter = () => useState(0)

type ElementOf<T> = T extends readonly (infer E)[] ? E : never;

type RouteParam<P> = P extends `${string}/:${infer Param}` ? Param : never;
type C = RouteParam<'/users/:id'>;   // 'id'
```

- `infer X` declares a type variable **inside** the `extends` clause, bound by matching
- Only allowed in the condition of a conditional type
- It works on components, functions, arrays, promises — and **strings**

---

# Recursive types

```tsx
type MenuItem = { label: string; href?: string; children?: MenuItem[] };

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type MyAwaited<T> = T extends PromiseLike<infer V> ? MyAwaited<V> : T;
type A = MyAwaited<Promise<Promise<number>>>;   // number
```

- A type alias may reference **itself** — for a menu tree, JSON, nested state
- `DeepReadonly` stops on primitives and functions, recurses on objects and arrays
- The compiler has a depth limit: around a thousand levels of instantiation

---

# Recursion with an accumulator

```tsx
type Tuple<N extends number, T, Acc extends T[] = []> =
  Acc['length'] extends N
    ? Acc
    : Tuple<N, T, [...Acc, T]>;

type RgbTuple = Tuple<3, number>;   // [number, number, number]

type Join<Parts extends string[], Sep extends string> =
  Parts extends [infer Head extends string, ...infer Rest extends string[]]
    ? Rest extends [] ? Head : `${Head}${Sep}${Join<Rest, Sep>}`
    : '';

type Path = Join<['users', ':id', 'posts'], '/'>;   // 'users/:id/posts' — a <Route path>
```

- A tuple's `length` is a **literal** number: a counter
- A default type parameter (`Acc = []`) carries state from one call to the next
- Variadic tuple types (`[...Acc, T]`) append; `[infer Head, ...infer Rest]` destructure

---

# Branded types

```tsx
type PostId = number;
type CommentId = number;
<CommentThread commentId={post.id} />   // ✔ compiles — an alias is just a name

declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

type PostId = Brand<number, 'PostId'>;
type CommentId = Brand<number, 'CommentId'>;

function postId(value: number): PostId {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Not a post id: ${value}`);
  return value as PostId;
}

<PostLink id={42} />                      // ✘ a plain number is not a PostId
const other: CommentId = postId(42);      // ✘ another brand
```

- TypeScript is **structural**: two aliases of `number` are the same type
- The brand is a property that **never exists**: only the compiler sees it
- A **constructor function** is the one place that checks — and writes the `as`

---
src: ../../typescript-common/slides/07_type_level/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 7 - Type-level programming
