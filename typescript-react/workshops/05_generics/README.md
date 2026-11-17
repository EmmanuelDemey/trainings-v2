# TP 5 — Generics

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the building blocks of a small React app — a list, a data table, a grouping
> hook, a collection hook, an event emitter and a select box — that all work on
> `any`. They render, but every caller loses its types. Make them generic.

## Goal

Chapter 5 — Generics:

- Write **generic components and hooks**, and let TypeScript **infer** their
  type arguments from the props
- **Constrain** a type parameter with `extends`, and with **`keyof`**
- Write a **generic class** and a **generic hook**, with a type parameter that
  describes a whole API (one key per event)
- Stop a prop from widening the inference with **`NoInfer`**

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

- `tests/*.spec.tsx` **run** the code with Testing Library: they render the
  components (`render`) and the hooks (`renderHook`), and check what they do
- `tests/generics.test-d.tsx` is **never run**: Vitest hands it to the compiler.
  `expectTypeOf(x).toEqualTypeOf<T>()` fails when `x` is not exactly a `T`, and a
  `// @ts-expect-error` line fails when the line below it **compiles** — that is
  how a spec says "this JSX must be refused"

`npm run typecheck` is green from the start, and must stay so. Keep
`npm run test:watch` open.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `List<T>` | `src/List.tsx` | The `List` specs are green |
| 2 | `DataTable`, constrained by `keyof` | `src/DataTable.tsx` | The `DataTable` specs are green |
| 3 | `useGroupBy` | `src/useGroupBy.ts` | The `useGroupBy` specs are green |
| 4 | `useCollection<T extends Entity>` | `src/useCollection.ts` | The `useCollection` specs but `update` are green |
| 5 | `update`, with a `Partial<Omit<…>>` | `src/useCollection.ts` | All the `useCollection` specs are green |
| 6 | `Emitter<Events>` and `useEvent` | `src/emitter.ts` | The `Emitter` and `useEvent` specs are green |
| 7 | `Select` and `NoInfer` | `src/Select.tsx` | `npm test` is green |

## Steps

### 1. `List` — `src/List.tsx`

Give `ListProps` and `List` a type parameter `T`: `items` is a `readonly T[]`,
and `getKey` and `renderItem` take a `T`. Render one `<li>` per item. Write
`<List items={users} renderItem={(user) => …} />` in your editor and hover over
`user`: you never wrote `<List<User>>`, so who did?

→ **Done when** the `List` specs — runtime and types — are green.

### 2. `DataTable` — `src/DataTable.tsx`

`columns={['name', 'age']}` renders those two columns, and `columns={['email']}`
does **not** compile. Two type parameters: `T` for the rows, `K extends keyof T`
for the columns. The value of one cell is the **indexed access** `T[K]` — that is
what `renderCell` receives.

→ **Done when** the `DataTable` specs are green.

### 3. `useGroupBy` — `src/useGroupBy.ts`

`keyOf` computes a key from an item; the result has one array per key. The key
type is a type parameter too — `K extends PropertyKey` — and the result is a
`Partial<Record<K, T[]>>`: why `Partial`? Look at the third spec.

Write `groupBy` first, then type the hook the same way. The `??=` operator
creates a group the first time a key shows up.

→ **Done when** the four `useGroupBy` specs are green.

### 4. `useCollection` — `src/useCollection.ts`

`useCollection<User>()` stores users; `useCollection<{ name: string }>()` must
not compile. Constrain `T` with `extends Entity`, then replace every `any` with
`T` — the `useState` included. Implement `save` and `findById`.

→ **Done when** every `useCollection` spec but the two about `update` is green.

### 5. `update` — `src/useCollection.ts`

The changes can carry any field of `T`, **but** its `id`. Build that type from
`T` with `Omit` and `Partial` — chapter 6 is all about them, chapter 5 only
needs these two. Merge the changes into the stored entity and save it; throw
`No entity with id <id>` when there is nothing to update.

→ **Done when** every `useCollection` spec is green.

### 6. `Emitter` and `useEvent` — `src/emitter.ts`

`Events` is an object type: one key per event, its value the payload.
`on('added', listener)` must give the listener the payload of `added`, and
`emit('removed', …)` must not compile.

- Constrain `Events` with `extends object`. Why not `Record<string, unknown>`?
  Try it, and read what the compiler says about `ShopEvents`, an `interface`.
- `on` and `emit` take a `K extends keyof Events`; the payload is `Events[K]`.
- Store the listeners in a **mapped type**:
  `{ [K in keyof Events]?: Listener<Events[K]>[] }`.
- `on` returns the function that unsubscribes — exactly what a `useEffect`
  cleanup expects: `useEvent` subscribes in an effect and returns it.

→ **Done when** the `Emitter` and `useEvent` specs are green.

### 7. `Select` — `src/Select.tsx`

`<Select options={['light', 'dark']} onChange={(value) => …} />` must give
`value` the type `'light' | 'dark'`, not `string`, and
`defaultValue="blue"` must not compile.

1. Add a type parameter `T extends string`, used by `options`, `defaultValue`
   and `onChange`. The options keep their literal types: a type parameter
   constrained to `string` is inferred as a union of literals. But `"blue"`
   compiles — TypeScript infers `T` from **every** prop, so `T` becomes
   `'light' | 'dark' | 'blue'`.
2. Type `defaultValue` as `NoInfer<T>`: it is checked against `T`, never used to
   infer it.
3. `event.target.value` is a `string`: find the matching option instead of
   casting it.

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 8. *(Bonus)* — `useEventOnce`

Add `useEventOnce(emitter, event, listener)`: the listener runs on the first
emit, then unsubscribes itself, even if the component stays mounted. Write its
spec first.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the thirty specs
- [ ] `grep -rn TODO src` returns nothing
- [ ] No `any` is left in `src/`

**The behaviour is there**

- [ ] No JSX ever writes a type argument: every one is inferred from the props
- [ ] A column the rows do not have, an entity without an id, an unknown event,
      an option that does not exist — each is a **compile** error
- [ ] `update` cannot change an id

**You can explain**

- [ ] What a type parameter is, and how TypeScript infers it from the props of
      a component
- [ ] What `K extends keyof T` allows, and what `T[K]` is
- [ ] Why `"blue"` compiled in step 7 before `NoInfer`, and what `NoInfer` changed

## Going further

- Give `useCollection` a second type parameter for the id —
  `useCollection<T extends { id: Id }, Id = string>` — and store an entity with
  a numeric id.
- Write a generic `createContext` helper — `createSafeContext<T>()` — that
  returns a provider and a `useX()` hook throwing when used outside the
  provider: `T` flows from the provider's `value` to the hook's return type.
- Write `defineRoutes(routes)` that returns its argument, and call it with
  `{ home: '/', user: '/users/:id' }`. Hover: the paths are `string`. Add a
  `const` type parameter — what do they become?
- In an arrow function component, `<T,>(props: ListProps<T>) => …` needs that
  trailing comma in a `.tsx` file: remove it, and read the error.
