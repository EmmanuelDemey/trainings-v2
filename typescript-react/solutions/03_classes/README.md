# TP 3 — Classes & interfaces

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the contract of a todo store — an `interface` a component reads with
> `useSyncExternalStore` — and the specs every implementation must pass. Write
> two of them, one in memory, one in `localStorage`, without writing the logic
> twice.

## Goal

Chapter 3 — Classes & interfaces:

- Write a class that **`implements`** an interface
- Share code through an **`abstract`** class, and leave the rest to its
  subclasses with **`protected abstract`** methods
- Hide state with a **`#private`** field, expose it with a **getter**, and count
  instances with a **`static`** member
- Extend **`Error`** with a class of your own, and catch it with `instanceof` —
  in an **error boundary**, the one class component React still needs
- Accept an id as a `string` **or** a `number`, and narrow it with `typeof`
- Write classes Node.js can run **as is**: no parameter properties, no `enum`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --typecheck
npm run test:watch   # vitest --typecheck, in watch mode
npm run typecheck    # tsc --noEmit
```

The specs are given and **red**:

- `tests/todo-store.contract.tsx` is **the behaviour of a todo store**, written
  once — `useTodos` re-rendering a component included:
  `tests/in-memory-todo-store.spec.tsx` and
  `tests/local-storage-todo-store.spec.tsx` run it against each implementation.
  Read it first.
- `tests/TodoErrorBoundary.spec.tsx` and `tests/TodoPage.spec.tsx` render the
  components with Testing Library.
- `tests/types.test-d.tsx` is checked by the compiler, never run. A
  `// @ts-expect-error` line is a spec too: it fails when the line **compiles**.

`src/todo-store.ts` holds the `TodoStore` interface; `src/useTodos.ts` and
`src/TodoPage.tsx` are written already. Keep `npm run test:watch` open.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `TodoNotFoundError`, `toId` and `TodoErrorBoundary` | `src/todo-store.ts`, `src/TodoErrorBoundary.tsx` | The `toId`, `TodoNotFoundError` and `TodoErrorBoundary` specs are green |
| 2 | Make `BaseTodoStore` abstract | `src/base-todo-store.ts` | The "abstract base class" and "how they store" type specs are green |
| 3 | `subscribe`, `getSnapshot` and the three operations, once | `src/base-todo-store.ts` | — (nothing runs until step 4) |
| 4 | `InMemoryTodoStore` | `src/in-memory-todo-store.ts` | The `InMemoryTodoStore` and `TodoPage` specs are green |
| 5 | `LocalStorageTodoStore` | `src/local-storage-todo-store.ts` | `npm test` and `npm run typecheck` are green |

## Steps

### 1. Ids and errors — `src/todo-store.ts`, `src/TodoErrorBoundary.tsx`

1. `TodoNotFoundError` extends `Error`. Pass the message to `super(…)`, set
   `this.name`, and keep the id in a `readonly` field **declared in the class
   body** and assigned in the constructor.
2. `toId` takes a `TodoId` — `string | number`: a route param is a string.
   Narrow it with `typeof`, turn the string into a number, and refuse anything
   that is not a positive integer.
3. `TodoErrorBoundary` extends `Component<Props, State>`. Call `super(props)` in
   its constructor before setting `this.state`, catch the error in `static
   getDerivedStateFromError`, and in `render` — marked **`override`** — show
   the message of a `TodoNotFoundError` (`instanceof`), throw any other error
   again.

> Why not `constructor(readonly id: number)`? That **parameter property** is
> TypeScript-only syntax that emits code: `erasableSyntaxOnly` refuses it,
> because Node.js — which only strips types — could not run it.

→ **Done when** the `toId`, `TodoNotFoundError` and `TodoErrorBoundary` specs are green.

### 2. An abstract base — `src/base-todo-store.ts`

Nobody should write `new BaseTodoStore()`, and nobody outside a todo store
should call `load` or `save` — yet every subclass **must** write them. Make the
class `abstract`, and turn both methods into `protected abstract` declarations,
with no body.

→ **Done when** the type specs "share an abstract base class" and "do not
expose how they store their todos" are green.

### 3. The operations — `src/base-todo-store.ts`

1. `useTodos` hands `store.subscribe` and `store.getSnapshot` to
   `useSyncExternalStore` **detached** from `store`: as methods, `this` would be
   `undefined`. Write them as **arrow function fields**. Keep the listeners in a
   `#private` `Set`. `getSnapshot` loads the todos once, then returns the
   **same** array until something changes — or React renders forever.
2. Write `add`, `toggle` and `remove` **on top of `load` and `save`** — none of
   them knows where the todos live. A new todo gets the highest id so far,
   plus one: an id is never reused, even after a `remove`. An unknown id is a
   `TodoNotFoundError`. Never mutate the array: build a new one, `save` it,
   then call the listeners.

→ **Done when** the code compiles — the specs run in the next step.

### 4. In memory — `src/in-memory-todo-store.ts`

Keep the todos in a `#todos` field. Unlike `private`, `#` is **JavaScript**:
the field is invisible at run time too — the spec checks with `Object.keys`,
where only the two arrow functions of step 3 show up. Write `load` and `save`,
then the `size` getter, and a `static #created` counter the constructor
increments, read through `static get created()`.

→ **Done when** the `InMemoryTodoStore` specs — the contract and the three of
its own — and the `TodoPage` specs are green.

### 5. In `localStorage` — `src/local-storage-todo-store.ts`

Keep `key` in a `readonly` field. `load` reads and parses
`localStorage.getItem(this.key)`, `save` writes it back as JSON. Nothing stored
yet is not an error: it is an empty list — and so is something that is not
JSON. The `catch` receives an `unknown` — narrow it with `instanceof
SyntaxError` before you swallow it.

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 6. *(Bonus)* — a priority without `enum`

Add a `priority` to `Todo`: `low`, `normal` or `high`, picked in a `<select>`.
`enum` is not erasable either: write `const Priority = { Low: 'low', … } as
const`, derive the type `Priority` from it, and type the `useState` of the
select with it.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the forty-four specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `subscribe`, `getSnapshot`, `add`, `toggle` and `remove` are written once, in `BaseTodoStore`
- [ ] `BaseTodoStore` cannot be instantiated, `load` and `save` cannot be called from outside
- [ ] `toggle('2')` and `toggle(2)` do the same thing
- [ ] No parameter property, no `enum`, no `any`

**You can explain**

- [ ] What `implements` checks — and what it does **not** give the class
- [ ] `private` versus `#private`: which one still exists at run time
- [ ] Why an abstract class here, rather than an interface alone
- [ ] Why `erasableSyntaxOnly` refuses parameter properties and `enum`

## Going further

- Write a third implementation, `SessionStorageTodoStore`, in five lines. How
  many specs does it pass for free?
- Replace `abstract class` with **composition**: a `TodoStore` built from a
  `Storage` interface (`load`, `save`) passed to its constructor. Which design
  would you rather test?
- Swap `protected` for `private` on `load`. What does the checker say about the
  subclasses?
- Turn `subscribe` back into a method, and run the `useTodos` spec. What is
  `this`? Then pass `(listener) => store.subscribe(listener)` from `useTodos`
  instead: which side should own the fix?
