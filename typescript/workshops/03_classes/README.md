# TP 3 — Classes & interfaces

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the contract of a todo list — an `interface` — and the specs every
> implementation must pass. Write two of them, one in memory, one on disk,
> without writing the logic twice.

## Goal

Chapter 3 — Classes & interfaces:

- Write a class that **`implements`** an interface
- Share code through an **`abstract`** class, and leave the rest to its
  subclasses with **`protected abstract`** methods
- Hide state with a **`#private`** field, expose it with a **getter**, and count
  instances with a **`static`** member
- Extend **`Error`** with a class of your own, and catch it with `instanceof`
- Accept an id as a `string` **or** a `number`, and narrow it with `typeof`
- Write classes Node.js can run **as is**: no parameter properties, no `enum`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --typecheck
npm run test:watch   # the same, in watch mode
npm run typecheck    # tsc --noEmit
```

The specs are given and **red**:

- `tests/todo-list.contract.ts` is **the behaviour of a todo list**, written once:
  `tests/in-memory-todo-list.spec.ts` and `tests/file-todo-list.spec.ts` run it
  against each implementation. Read it first.
- `tests/types.test-d.ts` is checked by the compiler, never run. A
  `// @ts-expect-error` line is a spec too: it fails when the line **compiles**.

`src/todo-list.ts` holds the `TodoList` interface. Keep `npm run test:watch` open.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `TodoNotFoundError` and `toId` | `src/todo-list.ts` | The `toId` and `TodoNotFoundError` specs are green |
| 2 | Make `BaseTodoList` abstract | `src/base-todo-list.ts` | The "abstract base class" and "how they store" type specs are green |
| 3 | The four operations, once | `src/base-todo-list.ts` | — (nothing runs until step 4) |
| 4 | `InMemoryTodoList` | `src/in-memory-todo-list.ts` | The `InMemoryTodoList` specs are green |
| 5 | `FileTodoList` | `src/file-todo-list.ts` | `npm test` and `npm run typecheck` are green |

## Steps

### 1. Ids and errors — `src/todo-list.ts`

1. `TodoNotFoundError` extends `Error`. Pass the message to `super(…)`, set
   `this.name`, and keep the id in a `readonly` field **declared in the class
   body** and assigned in the constructor.
2. `toId` takes a `TodoId` — `string | number`. Narrow it with `typeof`, turn the
   string into a number, and refuse anything that is not a positive integer.

> Why not `constructor(readonly id: number)`? That **parameter property** is
> TypeScript-only syntax that emits code: `erasableSyntaxOnly` refuses it,
> because Node.js — which only strips types — could not run it.

→ **Done when** the `toId` and `TodoNotFoundError` specs are green.

### 2. An abstract base — `src/base-todo-list.ts`

Nobody should write `new BaseTodoList()`, and nobody outside a todo list should
call `load` or `save` — yet every subclass **must** write them. Make the class
`abstract`, and turn both methods into `protected abstract` declarations, with
no body.

→ **Done when** the type specs "share an abstract base class" and "do not
expose how they store their todos" are green.

### 3. The four operations — `src/base-todo-list.ts`

Write `add`, `list`, `toggle` and `remove` **on top of `load` and `save`** —
none of them knows where the todos live. A new todo gets the highest id so far,
plus one: an id is never reused, even after a `remove`. An unknown id is a
`TodoNotFoundError`. Never mutate the array `load` gave you: build a new one,
and `save` it.

→ **Done when** the code compiles — the specs run in the next step.

### 4. In memory — `src/in-memory-todo-list.ts`

Keep the todos in a `#todos` field. Unlike `private`, `#` is **JavaScript**:
the field is invisible at run time too — the spec checks with `Object.keys`.
Write `load` and `save`, then the `size` getter, and a `static #created`
counter the constructor increments, read through `static get created()`.

→ **Done when** the `InMemoryTodoList` specs — the contract and the three of
its own — are green.

### 5. On disk — `src/file-todo-list.ts`

Keep `path` in a `readonly` field. `load` reads and parses the file with
`readFile` from `node:fs/promises`, `save` writes it back as JSON. A file that
does not exist yet is not an error: it is an empty list. The `catch` receives
an `unknown` — narrow it before you read its `code`.

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 6. *(Bonus)* — a status without `enum`

Add a `priority` to `Todo`: `low`, `normal` or `high`. `enum` is not erasable
either: write `const Priority = { Low: 'low', … } as const`, and derive the type
`Priority` from it.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the thirty-four specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `add`, `list`, `toggle` and `remove` are written once, in `BaseTodoList`
- [ ] `BaseTodoList` cannot be instantiated, `load` and `save` cannot be called from outside
- [ ] `toggle('2')` and `toggle(2)` do the same thing
- [ ] No parameter property, no `enum`, no `any`

**You can explain**

- [ ] What `implements` checks — and what it does **not** give the class
- [ ] `private` versus `#private`: which one still exists at run time
- [ ] Why an abstract class here, rather than an interface alone
- [ ] Why `erasableSyntaxOnly` refuses parameter properties and `enum`

## Going further

- Write a third implementation, `LocalStorageTodoList`, in five lines. How many
  specs does it pass for free?
- Replace `abstract class` with **composition**: a `TodoList` built from a
  `Store` interface (`load`, `save`) passed to its constructor. Which design
  would you rather test?
- Swap `protected` for `private` on `load`. What does the checker say about the
  subclasses?
