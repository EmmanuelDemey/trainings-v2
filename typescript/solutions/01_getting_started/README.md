# TP 1 — Getting started

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> a tiny todo-list CLI written in TypeScript — but with the checker switched to
> its most lenient setting. Turn it on, read what it finds, and finish the code.

## Goal

Chapter 1 — From JavaScript to TypeScript:

- Run a `.ts` file **as is** with Node.js, and see that running is **not**
  type checking
- Read a **`tsconfig.json`**, and turn on **`strict`**
- Fix the errors `strict` finds — **implicit `any`**, and a value that may be
  **`undefined`**
- Annotate a function's **parameters** and its **return type**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm start            # node src/cli.ts — lists the todos
npm start -- add "Buy bread"
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
npm run typecheck    # tsc --noEmit
```

`tests/todo.spec.ts` and `tests/tsconfig.spec.ts` are given and **red**. Keep
`npm run test:watch` open.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Turn on `strict` | `tsconfig.json` | The `tsconfig` spec is green, and `npm run typecheck` lists errors |
| 2 | `createTodo` | `src/todo.ts` | The `createTodo` specs are green |
| 3 | `toggle` | `src/todo.ts` | The `toggle` specs are green |
| 4 | `summary` | `src/todo.ts` | The `summary` specs are green |
| 5 | `formatTodo`, and the last error in the CLI | `src/todo.ts`, `src/cli.ts` | `npm test` and `npm run typecheck` are green |

## Steps

### 0. Run it first

Run `npm start`. It works — even though `npm run typecheck` will soon have a lot
to say. Node.js **strips** the types and runs what is left: it never reads them.

Open `src/todo.ts` in your editor and hover over `createTodo`: what does it say
the type of `title` is?

### 1. Turn on `strict` — `tsconfig.json`

Set `"strict": true`, then run `npm run typecheck`. Read every error before
fixing any: which ones are about a parameter, which one is about a value that
may be missing?

→ **Done when** the `tsconfig` spec is green and you can say what `noImplicitAny`
and `strictNullChecks` — both switched on by `strict` — each complain about.

### 2. `createTodo` — `src/todo.ts`

Type the two parameters, and say the function returns a `Todo`. Then make the
specs pass: the title is trimmed, the todo starts **not** done, and an empty
title throws `A todo needs a title`.

→ **Done when** the three `createTodo` specs are green.

### 3. `toggle` — `src/todo.ts`

Return a **new** todo with `done` flipped: the one passed in must not change.
The spread syntax (`{ ...todo }`) is your friend.

→ **Done when** the two `toggle` specs are green.

### 4. `summary` — `src/todo.ts`

`todos` is an array of `Todo`. Count the ones done, and return `"2/3 done"` —
or `"nothing to do"` for an empty list. Annotate the return type: what does the
checker say if one branch forgets to `return`?

→ **Done when** the two `summary` specs are green.

### 5. `formatTodo`, and the CLI — `src/todo.ts`, `src/cli.ts`

`[x] 1 Buy milk` for a todo done, `[ ] 2 Call Bob` otherwise. Then run
`npm run typecheck` once more: one error is left, in `src/cli.ts`.
`todos.at(-1)` returns `Todo | undefined` — **why** does the checker refuse to
pass that to `formatTodo`? Fix it **without** a `!` or an `as`.

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 6. *(Bonus)* — a `done` command

Add a `done <id>` command to the CLI that toggles the todo with that id. What
type does `process.argv` give you for the id, and what do you do about it?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the ten specs
- [ ] `npm start` lists the todos
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `strict` is on
- [ ] Every function of `src/todo.ts` has typed parameters and a return type
- [ ] `toggle` never mutates the todo it receives
- [ ] The CLI has no `!` and no `as`

**You can explain**

- [ ] Why `npm start` worked before a single type was fixed
- [ ] What an implicit `any` is, and why `strict` refuses it
- [ ] Why `todos.at(-1)` may be `undefined`, while `todos[todos.length - 1]` is
      typed `Todo` — and which of the two is telling the truth

## Going further

- Add `"noUncheckedIndexedAccess": true` to `tsconfig.json`. What does
  `todos[0]` become, and how many lines of `src/cli.ts` does it flag?
- Run `npx tsc --showConfig`: which options does `strict` turn on, one by one?
- Run `npx tsc --noEmit --extendedDiagnostics`. Where does the compiler spend its time?
