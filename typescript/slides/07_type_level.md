---
layout: cover
---

# 7 - Type-level programming

---
src: ../../typescript-common/slides/07_type_level/learning-objectives.md
---

---

# Types are a language

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Exclude<T, U> = T extends U ? never : T;

type Awaited<T> = T extends PromiseLike<infer V> ? Awaited<V> : T;
```

- The utility types of chapter 6 are written **in TypeScript**, in `lib.es5.d.ts`
- The type system has loops (mapped types), conditions (conditional types),
  pattern matching (`infer`), strings (template literals) and recursion
- Rarely needed in application code — **often** in libraries, and to **read**
  their error messages

---

# Mapped types

```ts
type Flags<T> = {
  [K in keyof T]: boolean;
};

interface Features {
  darkMode: () => void;
  newCheckout: () => void;
}

type FeatureFlags = Flags<Features>;
// { darkMode: boolean; newCheckout: boolean }

type Getters<T> = {
  [K in keyof T]: () => T[K];
};
```

- `[K in keyof T]` loops over the keys of `T`
- The value can use `K`, and read `T[K]`
- The loop can run over any union of keys: `[K in 'a' | 'b']`, `[K in Role]`

---

# Modifiers: `readonly` and `?`

```ts
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyPartial<T>  = { [K in keyof T]?: T[K] };

type Mutable<T>    = { -readonly [K in keyof T]: T[K] };   // removes readonly
type MyRequired<T> = { [K in keyof T]-?: T[K] };           // removes ?

interface Point {
  readonly x: number;
  readonly y?: number;
}

type Editable = Mutable<Point>;     // { x: number; y?: number }
type Complete = MyRequired<Point>;  // { readonly x: number; readonly y: number }
```

- A mapped type over `keyof T` **keeps** the modifiers of `T` — it is *homomorphic*
- `+` (implicit) adds a modifier, `-` removes it

---

# Template literal types

```ts
type ChessFile = 'A' | 'B' | 'C';
type ChessRank = 1 | 2 | 3;
type Square = `${ChessFile}${ChessRank}`;
// 'A1' | 'A2' | 'A3' | 'B1' | … | 'C3' — every combination

type RgbColor = `rgb(${number}, ${number}, ${number})`;
const red: RgbColor = 'rgb(255, 0, 0)';   // ✔
const broken: RgbColor = 'rgb(255, 0)';   // ✘

type Getter = `get${Capitalize<'name' | 'email'>}`;   // 'getName' | 'getEmail'
```

- The same syntax as a JavaScript template string, on **types**
- A union inside expands to **every** combination
- `${number}`, `${string}` match any number or string
- Built-in: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`

---

# Key remapping with `as`

```ts
interface Events {
  add: { sku: string };
  remove: { sku: string };
  move: { from: number; to: number };
}

type Handlers<T> = {
  [K in keyof T & string as `on${Capitalize<K>}`]: (payload: T[K]) => void;
};

const handlers: Handlers<Events> = {
  onAdd: ({ sku }) => {},
  onRemove: ({ sku }) => {},
  onMove: ({ from, to }) => {},
};
```

- `as` **renames** each key — here with a template literal type
- `keyof T & string`: `keyof` may hold `number` and `symbol` keys, which
  `Capitalize` refuses
- Remapping a key to `never` **removes** it

---

# Conditional types

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>;   // true
type B = IsString<42>;        // false

type MyNonNullable<T> = T extends null | undefined ? never : T;

type ApiResult<T> = T extends unknown[] ? { items: T; total: number } : { item: T };
type Users = ApiResult<User[]>;   // { items: User[]; total: number }
type One = ApiResult<User>;       // { item: User }
```

- `A extends B ? X : Y` — "if `A` is assignable to `B`, then `X`, else `Y`"
- A `?:` on **types**: evaluated by the compiler, gone at run time
- `never` is the empty union: returning it **drops** a member

---

# Distributive conditional types

```ts
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

---

# `infer` — pattern matching on types

```ts
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type A = ElementOf<string[]>;   // string

type MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never;
type B = MyReturnType<() => Date>;   // Date

type FirstArg<F> = F extends (first: infer A, ...rest: never[]) => unknown ? A : never;

type RouteParam<P> = P extends `${string}/:${infer Param}` ? Param : never;
type C = RouteParam<'/users/:id'>;   // 'id'
```

- `infer X` declares a type variable **inside** the `extends` clause, bound by matching
- Only allowed in the condition of a conditional type
- It works on functions, arrays, promises — and **strings**

---

# Recursive types

```ts
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type MyAwaited<T> = T extends PromiseLike<infer V> ? MyAwaited<V> : T;
type A = MyAwaited<Promise<Promise<number>>>;   // number
```

- A type alias may reference **itself** — for trees, JSON, nested objects
- `DeepReadonly` stops on primitives and functions, recurses on objects and arrays
- The compiler has a depth limit: around a thousand levels of instantiation

---

# Recursion with an accumulator

```ts
type Tuple<N extends number, T, Acc extends T[] = []> =
  Acc['length'] extends N
    ? Acc
    : Tuple<N, T, [...Acc, T]>;

type RgbTuple = Tuple<3, number>;   // [number, number, number]

type Join<Parts extends string[], Sep extends string> =
  Parts extends [infer Head extends string, ...infer Rest extends string[]]
    ? Rest extends [] ? Head : `${Head}${Sep}${Join<Rest, Sep>}`
    : '';

type Path = Join<['users', ':id', 'posts'], '/'>;   // 'users/:id/posts'
```

- A tuple's `length` is a **literal** number: a counter
- A default type parameter (`Acc = []`) carries state from one call to the next
- Variadic tuple types (`[...Acc, T]`) append; `[infer Head, ...infer Rest]` destructure

---

# Branded types

```ts
type PostId = number;
type CommentId = number;
const commentId: CommentId = post.id;   // ✔ compiles — an alias is just a name

declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

type PostId = Brand<number, 'PostId'>;
type CommentId = Brand<number, 'CommentId'>;

function postId(value: number): PostId {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Not a post id: ${value}`);
  return value as PostId;
}

const id: PostId = 42;                    // ✘ a plain number is not a PostId
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
