# TP 9 — Modules & declaration files

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> a small blog package that depends on an **untyped** npm package, publishes
> events on a typed bus, and reads a global. Type what it uses, then ship it as
> a package other projects can import — JavaScript **and** declarations.

## Goal

Chapter 9 — Modules & declaration files:

- Write a **declaration file** (`.d.ts`) for a JavaScript package that ships
  no types — an **ambient module**
- Extend a type you do not own by **module augmentation** and **interface
  merging**
- Declare a **global** with `declare global`
- Build a package with `tsc`: **`declaration`**, **`isolatedDeclarations`**,
  **`rewriteRelativeImportExtensions`**
- Expose it through the **`exports`** of `package.json`, with its **`types`**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
npm run typecheck    # tsc --noEmit
npm run build        # tsc -p tsconfig.build.json — into dist/
```

`tests/blog.spec.ts`, `tests/types.test-d.ts` (type-level specs, checked by
`vitest --typecheck`) and `tests/build.spec.ts` are given and **red**. Keep
`npm run test:watch` open.

`slugify-lite` is installed from `vendor/slugify-lite/` — a stand-in for any
package on npm that ships plain JavaScript and no types. Do not change it.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Type `slugify-lite` | `src/types/slugify-lite.d.ts` | The `slugify-lite.d.ts` type specs are green |
| 2 | Add `article:published` to the bus | `src/articles.ts` | The `article:published` specs are green |
| 3 | Declare the `APP_VERSION` global | `src/types/globals.d.ts`, `src/version.ts` | The `banner` and `APP_VERSION` specs are green |
| 4 | Build the package, with its declarations | `tsconfig.build.json` | `npm run build` emits `.js` and `.d.ts` into `dist/` |
| 5 | Publish its types | `package.json` | `npm test` is green |

## Steps

### 1. Type `slugify-lite` — `src/types/slugify-lite.d.ts`

The starter holds a **shorthand** ambient module: `declare module 'slugify-lite';`.
It compiles — and makes everything the package exports `any`. Hover over
`slugify` in `src/articles.ts` to see it.

Read `vendor/slugify-lite/index.js`, and replace the shorthand with a
`declare module 'slugify-lite' { … }` block that exports `VERSION`, `words`,
`slugify` and its `SlugifyOptions` interface. A `.d.ts` holds **no code**: only
declarations — `export function slugify(…): string;`.

→ **Done when** the three `slugify-lite.d.ts` type specs are green.

### 2. Add `article:published` to the bus — `src/articles.ts`

Read `src/events.ts`: `EventMap` is empty, so `emit` accepts no event at all.
You do not change that file: you **augment** its module from yours.

```ts
declare module './events.ts' {
  interface EventMap {
    'article:published': { slug: string; title: string };
  }
}
```

The two `interface EventMap` declarations **merge**. Then call `emit` in
`publish`, and see the checker refuse a typo in the event name, or a payload
without its `title`.

→ **Done when** the four `article:published` specs are green — one in
`blog.spec.ts`, three in `types.test-d.ts`.

### 3. The `APP_VERSION` global — `src/types/globals.d.ts`, `src/version.ts`

The host page sets `APP_VERSION` before the blog starts. Declare it inside a
`declare global { … }` block with `var` — a global declared with `let` or
`const` does not land on `globalThis`. Why does the file need its
`export {}`? Then write `banner()`.

→ **Done when** the `banner` spec and the `APP_VERSION` type spec are green.

### 4. Build the package — `tsconfig.build.json`

Run `npm run build` and look at `dist/`: no `.d.ts`, and every `import` still
ends in `.ts` — which Node.js cannot resolve in `dist/`. Add:

- `rootDir: "./src"` — so `dist/` mirrors `src/`
- `declaration: true` — a `.d.ts` next to each `.js`
- `rewriteRelativeImportExtensions: true` — `./articles.ts` becomes `./articles.js`
- `isolatedDeclarations: true` — every export must carry its types **explicitly**,
  so any tool can write the `.d.ts` file by file, without the checker. Remove the
  return type of `publish` for a moment: what does it say?

→ **Done when** the first four `npm run build` specs are green.

### 5. Publish its types — `package.json`

`tests/consumer/` is another project that imports the blog **by its name**,
`tp-09-modules`. Node.js finds the JavaScript through `exports`; TypeScript
needs to find the declarations too. Add a `types` condition — **first**: the
conditions are read in order, and the first one that matches wins.

→ **Done when** `npm test` is green — the consumer spec included.

### 6. *(Bonus)* — a second entry point

Expose `src/events.ts` as `tp-09-modules/events`, with its own `exports` entry,
and import it from `tests/consumer/index.ts`.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the sixteen specs
- [ ] `npm run build` emits a `.js` and a `.d.ts` per source file into `dist/`
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `slugify-lite` has no `any` left in its types
- [ ] `emit('article:deleted', …)` is a compile error
- [ ] `vendor/` and `src/events.ts` are unchanged
- [ ] `package.json` exposes both the JavaScript and the declarations

**You can explain**

- [ ] What a shorthand ambient module buys you, and what it costs
- [ ] Why the bus can accept an event it never heard of — and who declares it
- [ ] What `isolatedDeclarations` demands, and which tools it speeds up
- [ ] Where you would look first for the types of a package that ships none —
      before writing them yourself

## Going further

- Search DefinitelyTyped for a package you use: `npm view @types/<name>`. Which
  version of the package does it describe?
- Switch `module` to `preserve` and `moduleResolution` to `bundler` in
  `tsconfig.json`: which import of the workshop stops being an error — and why
  would Node.js still refuse it?
- Run `npx tsc -p tsconfig.build.json --listEmittedFiles`.
