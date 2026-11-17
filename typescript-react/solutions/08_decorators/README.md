# TP 8 — Decorators

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the store of a shopping cart — a plain class that React components subscribe
> to — whose class, methods and accessor are already decorated. The decorators
> themselves compile — and do nothing. Make them work.

## Goal

Chapter 8 — Decorators:

- Write **method**, **auto-accessor** and **class** decorators with the
  **standard** (TC39) API — the TypeScript default, no `experimentalDecorators`
- Write **decorator factories**: `@logged(sink)`, `@min(0)`, `@command('add')`
- Read the **`context`** object: `context.name`, `context.metadata`
- Keep **`this`**, the arguments and the return value of what you wrap — even
  when a component calls the method from an event handler
- Store and read back **metadata** with `context.metadata` and `Symbol.metadata`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm start            # tsx src/main.tsx — a cart, its total, its commands, its HTML
npm test             # vitest run --typecheck
npm run test:watch   # vitest --typecheck, in watch mode
npm run typecheck    # tsc --noEmit
```

`tests/decorators.spec.tsx` is given and **red**: it renders the components of
`src/CartView.tsx` with Testing Library, clicks their buttons, and checks what
the decorated store does. Keep `npm run test:watch` open.

Decorators are **not** erasable syntax: Node.js's type stripping refuses them,
which is why `npm start` goes through **tsx**, why `tsconfig.json` has no
`erasableSyntaxOnly`, and why `vitest.config.ts` transforms the code — the JSX
included — with **esbuild** instead of `@vitejs/plugin-react`: read its comment.
`src/polyfill.ts` defines `Symbol.metadata`, which Node.js 24 does not ship yet.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `@logged(sink)` — a method decorator factory | `src/decorators.ts` | The `@logged` specs are green |
| 2 | `@memoize` — a cache per store instance | `src/decorators.ts` | The `@memoize` specs are green |
| 3 | `@min(n)` — an auto-accessor decorator | `src/decorators.ts` | The `@min` specs are green |
| 4 | `@jsonString` — a class decorator | `src/decorators.ts` | The `@jsonString` specs are green |
| 5 | `@command(name)` and `commandsOf` — metadata for `<CommandPalette>` | `src/decorators.ts` | `npm test` is green |

## Steps

### 0. Read the store first — `src/store.ts`, `src/cart.ts`

`Store` is given: `useStore(cart)` subscribes a component through
`useSyncExternalStore`, and `notify()` re-renders it. `@observable` is given
too — an auto-accessor decorator that calls `notify()` on every assignment: read
it, steps 3 and 6 use the same API.

In `CartStore`, every decorator is already applied. Note the **order** on
`add`: `@command` above `@logged`. Decorators are **evaluated** top to bottom,
and **applied** bottom to top — `@logged` wraps the method first. Same on
`discount`: `@min` checks the value before `@observable` notifies.

### 1. `@logged(sink)` — `src/decorators.ts`

A method decorator receives the method and a `ClassMethodDecoratorContext`,
and may return a **replacement** method. Return a `function` (not an arrow:
it needs its own `this`) that calls `target.call(this, ...args)`, then reports
`name(args) → result` to `sink`. The arguments and the result go through
`JSON.stringify`; the name is `context.name`. The spec clicks **Add a book** in
`<CartView>`: the `onClick` calls `cart.add('book', 20)`.

→ **Done when** the two `@logged` specs are green.

### 2. `@memoize` — `src/decorators.ts`

Cache the result by `JSON.stringify(args)`. `<ShippingQuote>` calls
`cart.shippingTo(country)` on **every render**: the quote must be computed once
per country. The cache must be **per instance**: where do you keep it, so that
two stores never share one — and so that a dropped store does not leak? (Hint:
a `WeakMap` keyed by `this`.)

→ **Done when** the two `@memoize` specs are green: re-rendering
`<ShippingQuote country="FR">` computes nothing new.

### 3. `@min(n)` — `src/decorators.ts`

An `accessor` field is a getter/setter pair over a private slot. Its decorator
receives `{ get, set }` and may return `{ init, get, set }`:

- `init(value)` sees the **initial** value, and returns the one to store
- `set(value)` replaces the setter — call `target.set.call(this, value)` to store

Both check `value < minimum`, and throw `RangeError('<name> must be >= <min>, got <value>')`.
`<DiscountForm>` catches it, and shows its message in a `role="alert"`.

→ **Done when** the three `@min` specs are green.

### 4. `@jsonString` — `src/decorators.ts`

A class decorator receives the class itself. Add a `toString` to its
`prototype` that returns `JSON.stringify(this)` — what the debug panel of
`<CartView>` prints with `` `${cart}` ``. *(Bonus)*: return a subclass
instead — `return class extends target { … }` — and compare.

→ **Done when** the two `@jsonString` specs are green.

### 5. `@command(name)` and `commandsOf` — `src/decorators.ts`

`context.metadata` is **one object per class**, shared by all the decorators of
that class, and attached to it as `CartStore[Symbol.metadata]` once the class is
defined. In `@command`, record `name → context.name` in a `commands` entry of
that object. In `commandsOf`, read `target[Symbol.metadata]` back: that is what
`<CommandPalette of={CartStore} />` lists.

→ **Done when** `npm test` is green, and `npm start` prints the commands.

### 6. *(Bonus)* — `@bound`

Write a method decorator that binds the method to its instance, using
`context.addInitializer`, so that `<button onClick={cart.clear}>` works —
without the arrow `() => cart.clear()`.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the thirteen specs
- [ ] `npm start` prints the cart, its total, its commands and its HTML
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Every wrapped method keeps its `this`, its arguments and its return value
- [ ] Two stores never share a memoized result
- [ ] `@min` refuses a bad value at initialisation **and** on assignment
- [ ] The commands of two classes never mix

**You can explain**

- [ ] In which order the decorators of `add` are applied, and why it matters here
- [ ] What `context.metadata` is, and when it lands on `Symbol.metadata`
- [ ] Why `npm start` needs tsx, and the specs esbuild, where the other
      workshops get by with Vite's default transform
- [ ] Two differences between these decorators and the `experimentalDecorators`
      ones Angular and NestJS use

## Going further

- Add `"experimentalDecorators": true` to `tsconfig.json` and run
  `npm run typecheck`. Read the errors: what does the legacy API expect instead?
- Write a field decorator (no `accessor`) that logs its initial value. Why can
  it not intercept later assignments — and so, why is `@observable` written on
  an `accessor`?
- Write `@deprecated(message)` that warns once per method, the first time a
  component calls it.
