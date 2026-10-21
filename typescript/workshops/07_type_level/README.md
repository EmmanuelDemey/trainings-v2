# TP 7 — Type-level programming

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> a file of type-level tools — `DeepReadonly`, `Handlers`, `Tuple`, `Get`… —
> that all compile but say nothing, and a `get(object, 'a.b.c')` function that
> works but accepts any path. Write the types, and the compiler will check the
> paths for you.

## Goal

Chapter 7 — Type-level programming:

- Write **mapped types**, add and remove **modifiers** (`readonly`, `?`), and
  **rename keys** with `as`
- Write **conditional types**, and capture part of a type with **`infer`**
- Build string types with **template literal types** and `Capitalize`
- Write **recursive types** — for nested objects, for tuples, for dotted paths
- Tell two strings apart with a **branded type**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --typecheck
npm run test:watch   # vitest --typecheck, in watch mode
npm run typecheck    # tsc --noEmit
```

Most of this TP happens in the type system: `tests/types.test-d.ts` is handed
to the compiler, never run. `tests/runtime.spec.ts` checks the two id
constructors and `get`. Both are given and **red**. Keep `npm run test:watch`
open.

A trick for every step: write a throwaway `type Test = DeepReadonly<User>` in
the file, and **hover** over `Test` to see what your type computes.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `DeepReadonly`, `Mutable`, `PartialBy` | `src/types.ts` | Their specs are green |
| 2 | `Handlers` and `MethodKeys` | `src/types.ts` | Their specs are green |
| 3 | `Unwrap`, `ElementOf`, `Tuple` | `src/types.ts` | The "conditional types and infer" specs are green |
| 4 | `RgbColor`, `PathOf`, `Get` | `src/types.ts` | The "template literal types" specs are green |
| 5 | `Brand` | `src/brand.ts` | The "branded types" specs are green |
| 6 | `userId` and `orderId` | `src/brand.ts` | `npm test` is green |

## Steps

### 1. Mapped types — `src/types.ts`

- `Mutable<T>`: a mapped type `{ [K in keyof T]: T[K] }` copies `T`. Prefix
  `readonly` with `-` to **remove** it.
- `DeepReadonly<T>`: the same, with `readonly`, and `DeepReadonly<T[K]>` for each
  value. A `number` must stay a `number`: only recurse when `T extends object`.
  A mapped type over an array gives a readonly array — check `tags`.
- `PartialBy<T, K>`: two halves, joined with `&` — the keys **not** in `K` as
  they are, the keys in `K` made optional. `Pick`, `Omit` and `Partial` are allowed here.

→ **Done when** the four `DeepReadonly`, `Mutable` and `PartialBy` specs are green.

### 2. Key remapping — `src/types.ts`

- `Handlers<Events>`: for each key `K`, a key named `` `on${Capitalize<K>}` ``,
  with `as`. `keyof Events` may hold numbers and symbols: intersect it with
  `string` first.
- `MethodKeys<T>`: map each key to **itself** when its value is a function, to
  `never` otherwise, then index the result with `[keyof T]` — the `never`s vanish
  from the union.

→ **Done when** the `Handlers` and `MethodKeys` specs are green.

### 3. Conditional types and `infer` — `src/types.ts`

- `Unwrap<T>`: if `T` is a `PromiseLike<infer Inner>`, unwrap `Inner` again;
  otherwise `T`. That is how the built-in `Awaited` works.
- `ElementOf<T>`: `infer` the element type of a `readonly (infer E)[]`. Why
  `readonly`? Try without it on the tuple of the spec.
- `Tuple<N, T>`: a third type parameter accumulates the items —
  `Acc extends T[] = []`. Stop when `Acc['length'] extends N`; otherwise call
  `Tuple` again with one more item.

→ **Done when** the three "conditional types and infer" specs are green.

### 4. Template literal types — `src/types.ts`

- `RgbColor`: `${number}` matches any number in a string type.
- `PathOf<T>`: for each key `K`, either `K` (a leaf) or `` `${K}.${PathOf<T[K]>}` ``
  (an object). Map, then index with `[keyof T & string]`, as in step 2.
- `Get<T, P>`: if `P` is `` `${infer Head}.${infer Rest}` ``, go one level down
  in `T` with `Head` and carry on with `Rest`; otherwise `P` is the last key.
  An unknown key gives `never`.

`src/get.ts` already uses `PathOf` and `Get`: once they are right, hover over
`get(ada, '…')` in the spec file — your editor now **completes the paths**.

→ **Done when** the four "template literal types" specs are green.

### 5. `Brand` — `src/brand.ts`

`type UserId = string` and `type OrderId = string` are the same type: an alias
is just a name. Intersect `T` with an object that carries the brand:
`T & { readonly [brand]: B }`, where `brand` is a `declare const brand: unique symbol`.
The property never exists at run time — only the compiler sees it.

→ **Done when** the three "branded types" specs are green, and the two id
constructors no longer compile.

### 6. `userId` and `orderId` — `src/brand.ts`

Check the format, throw `Not a user id: <value>` (or `Not an order id: <value>`)
otherwise, then **assert** the brand with `as`. Those two functions are the only
places the app may write that `as`.

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 7. *(Bonus)* — `DeepPartial`

Write `DeepPartial<T>`, and use it to type a `merge(defaults, overrides)` function
for nested settings. What should an array become: partial elements, or left as it is?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the twenty-two specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `get(ada, 'address.zip')` does not compile, and your editor completes the paths
- [ ] A plain string is never a `UserId`, and a `UserId` is never an `OrderId`
- [ ] The only `as` of `src/brand.ts` are in the two constructors

**You can explain**

- [ ] What `-readonly` and `?` do in a mapped type, and what `as` does to a key
- [ ] Why `MethodKeys` gives a union without the non-method keys
- [ ] What `infer` captures, and where it may be written
- [ ] Why a branded type costs nothing at run time

## Going further

- Write `IsUnion<T>`. You will need to stop a conditional type from being
  **distributive**: wrap both sides in `[ ]`.
- `PathOf<User>` stops at `tags`, an array. Make it list `tags.${number}` too.
- `Tuple<1000, number>` — what does the compiler say, and why is there a limit?
