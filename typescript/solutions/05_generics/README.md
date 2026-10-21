# TP 5 — Generics

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> four small building blocks — array helpers, an in-memory repository, an event
> emitter and a select box — that all work on `any`. They run, but every caller
> loses its types. Make them generic.

## Goal

Chapter 5 — Generics:

- Write **generic functions**, and let TypeScript **infer** their type arguments
- **Constrain** a type parameter with `extends`, and with **`keyof`**
- Write a **generic class**, and a type parameter that describes a whole API
  (one key per event)
- Stop a parameter from widening the inference with **`NoInfer`**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --typecheck
npm run test:watch   # vitest --typecheck, in watch mode
npm run typecheck    # tsc --noEmit
```

The specs come in two kinds, both given and **red**:

- `tests/*.spec.ts` **run** the code: they check what it does
- `tests/generics.test-d.ts` is **never run**: Vitest hands it to the compiler.
  `expectTypeOf(x).toEqualTypeOf<T>()` fails when `x` is not exactly a `T`, and a
  `// @ts-expect-error` line fails when the line below it **compiles** — that is
  how a spec says "this call must be refused"

`npm run typecheck` is green from the start, and must stay so. Keep
`npm run test:watch` open.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `first<T>` | `src/collections.ts` | The `first` specs are green |
| 2 | `pluck`, constrained by `keyof` | `src/collections.ts` | The `pluck` specs are green |
| 3 | `groupBy` | `src/collections.ts` | The `groupBy` specs are green |
| 4 | `Repository<T extends Entity>` | `src/repository.ts` | The `Repository` specs but `update` are green |
| 5 | `update`, with a `Partial<Omit<…>>` | `src/repository.ts` | All the `Repository` specs are green |
| 6 | `Emitter<Events>` | `src/emitter.ts` | The `Emitter` specs are green |
| 7 | `createSelect` and `NoInfer` | `src/select.ts` | `npm test` is green |

## Steps

### 1. `first` — `src/collections.ts`

Give the function a type parameter `T`: it takes a `readonly T[]` and returns
`T | undefined`. Call it on `[1, 2, 3]` in your editor and hover: you never
wrote `first<number>`, so who did?

→ **Done when** the three `first` specs — runtime and types — are green.

### 2. `pluck` — `src/collections.ts`

`pluck(users, 'age')` is a `number[]`, `pluck(users, 'role')` a
`('admin' | 'member')[]`, and `pluck(users, 'email')` does **not** compile. Two
type parameters: `T` for the items, `K extends keyof T` for the key. The type
of one value is the **indexed access** `T[K]`.

→ **Done when** the three `pluck` specs are green.

### 3. `groupBy` — `src/collections.ts`

`keyOf` computes a key from an item; the result has one array per key. The key
type is a type parameter too — `K extends PropertyKey` — and the result is a
`Partial<Record<K, T[]>>`: why `Partial`? Look at the third spec.

The `??=` operator creates a group the first time a key shows up.

→ **Done when** the four `groupBy` specs are green.

### 4. `Repository` — `src/repository.ts`

`new Repository<User>()` stores users; `new Repository<{ name: string }>()` must
not compile. Constrain `T` with `extends Entity`, then replace every `any` with
`T` — the `Map` included. Implement `save`, `findById` and `findAll`.

→ **Done when** every `Repository` spec but the three about `update` is green.

### 5. `update` — `src/repository.ts`

The changes can carry any field of `T`, **but** its `id`. Build that type from
`T` with `Omit` and `Partial` — chapter 6 is all about them, chapter 5 only
needs these two. Merge the changes into the stored entity, save it, return it;
throw `No entity with id <id>` when there is nothing to update.

→ **Done when** every `Repository` spec is green.

### 6. `Emitter` — `src/emitter.ts`

`Events` is an object type: one key per event, its value the payload.
`on('added', listener)` must give the listener the payload of `added`, and
`emit('removed', …)` must not compile.

- Constrain `Events` with `extends object`. Why not `Record<string, unknown>`?
  Try it, and read what the compiler says about `ShopEvents`, an `interface`.
- `on` and `emit` take a `K extends keyof Events`; the payload is `Events[K]`.
- Store the listeners in a **mapped type**:
  `{ [K in keyof Events]?: Listener<Events[K]>[] }`.
- `on` returns the function that unsubscribes.

→ **Done when** the five `Emitter` specs are green.

### 7. `createSelect` — `src/select.ts`

`createSelect(['light', 'dark'], 'dark').selected` must be `'light' | 'dark'`,
not `string`, and `createSelect(['light', 'dark'], 'blue')` must not compile.

1. Add a type parameter `T extends string`, used by both parameters. The
   options keep their literal types: a type parameter constrained to `string`
   is inferred as a union of literals. But `'blue'` compiles — TypeScript infers
   `T` from **both** arguments, so `T` becomes `'light' | 'dark' | 'blue'`.
2. Type `initial` as `NoInfer<T>`: it is checked against `T`, never used to infer it.

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 8. *(Bonus)* — `once`

Add `once<K extends keyof Events>(event: K, listener: …)` to `Emitter`: the
listener runs on the first emit, then unsubscribes itself. Write its spec first.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the twenty-seven specs
- [ ] `grep -rn TODO src` returns nothing
- [ ] No `any` is left in `src/`

**The behaviour is there**

- [ ] No caller ever writes a type argument: every one is inferred
- [ ] A key the items do not have, an entity without an id, an unknown event,
      an option that does not exist — each is a **compile** error
- [ ] `update` cannot change an id

**You can explain**

- [ ] What a type parameter is, and when TypeScript infers it for you
- [ ] What `K extends keyof T` allows, and what `T[K]` is
- [ ] Why `'blue'` compiled in step 7 before `NoInfer`, and what `NoInfer` changed

## Going further

- Give `Repository` a second type parameter for the id — `Repository<T extends { id: Id }, Id = string>` — and store an entity with a numeric id.
- `pluck` returns `T[K][]`. Write `pick(items, ...keys)` that returns
  `Pick<T, K>[]`: what does `K` become when you pass two keys?
- Write `defineRoutes(routes)` that returns its argument, and call it with
  `{ home: '/', user: '/users/:id' }`. Hover: the paths are `string`. Add a
  `const` type parameter — what do they become?
- Make `findById` an **overload**: `findById(id)` returns `T | undefined`,
  `findById(id, { required: true })` returns `T` or throws.
