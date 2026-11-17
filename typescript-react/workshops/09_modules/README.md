# TP 9 — Modules & declaration files

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> a small React component library that depends on an **untyped** npm package,
> styles its badges with a CSS custom property React's types do not know, and
> reads a global. Type what it uses, then ship it as a package other React apps
> can import — JavaScript **and** declarations.

## Goal

Chapter 9 — Modules & declaration files:

- Write a **declaration file** (`.d.ts`) for a JavaScript package that ships
  no types — an **ambient module**
- Extend a type you do not own — React's `CSSProperties` — by **module
  augmentation** and **interface merging**
- Declare a **global** with `declare global`
- Build a component library with `tsc`: **`declaration`**,
  **`isolatedDeclarations`**, **`rewriteRelativeImportExtensions`**
- Expose it through the **`exports`** of `package.json`, with its **`types`**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --typecheck
npm run test:watch   # vitest --typecheck, in watch mode
npm run typecheck    # tsc --noEmit
npm run build        # tsc -p tsconfig.build.json — into dist/
```

`tests/library.spec.tsx` (renders the components with Testing Library),
`tests/types.test-d.tsx` (type-level specs, checked by `vitest --typecheck`) and
`tests/build.spec.tsx` are given and **red**. Keep `npm run test:watch` open.

`slugify-lite` is installed from `vendor/slugify-lite/` — a stand-in for any
package on npm that ships plain JavaScript and no types. Do not change it.
`react` is a **peer** dependency: the app that installs the library brings its own.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Type `slugify-lite` | `src/types/slugify-lite.d.ts` | The `slugify-lite.d.ts` type specs are green |
| 2 | Add `--badge-color` to React's `CSSProperties` | `src/Badge.tsx` | The `--badge-color` specs are green |
| 3 | Declare the `APP_VERSION` global | `src/types/globals.d.ts`, `src/VersionBanner.tsx` | The `VersionBanner` and `APP_VERSION` specs are green |
| 4 | Build the library, with its declarations | `tsconfig.build.json` | `npm run build` emits `.js` and `.d.ts` into `dist/` |
| 5 | Publish its types | `package.json` | `npm test` is green |

## Steps

### 1. Type `slugify-lite` — `src/types/slugify-lite.d.ts`

The starter holds a **shorthand** ambient module: `declare module 'slugify-lite';`.
It compiles — and makes everything the package exports `any`. Hover over
`slugify` in `src/ArticleCard.tsx` to see it.

Read `vendor/slugify-lite/index.js`, and replace the shorthand with a
`declare module 'slugify-lite' { … }` block that exports `VERSION`, `words`,
`slugify` and its `SlugifyOptions` interface. A `.d.ts` holds **no code**: only
declarations — `export function slugify(…): string;`.

→ **Done when** the three `slugify-lite.d.ts` type specs are green.

### 2. Add `--badge-color` to `CSSProperties` — `src/Badge.tsx`

`<Badge>` colours itself through a CSS custom property, `--badge-color`. Write
`style={{ '--badge-color': color }}` on its `<span>`: the checker refuses it —
`CSSProperties`, in `@types/react`, lists the known CSS properties only. You do
not change `@types/react`: you **augment** its module from yours.

```tsx
declare module 'react' {
  interface CSSProperties {
    '--badge-color'?: string;
  }
}
```

The two `interface CSSProperties` declarations **merge** — in every file of the
project, on every element. Then see the checker refuse a typo:
`'--badge-colour'`.

→ **Done when** the four `--badge-color` specs are green — one in
`library.spec.tsx`, three in `types.test-d.tsx`.

### 3. The `APP_VERSION` global — `src/types/globals.d.ts`, `src/VersionBanner.tsx`

The host page sets `APP_VERSION` before the components render. Declare it inside
a `declare global { … }` block with `var` — a global declared with `let` or
`const` does not land on `globalThis`. Why does the file need its
`export {}`? Then render it in `<VersionBanner>`.

→ **Done when** the `VersionBanner` spec and the `APP_VERSION` type spec are green.

### 4. Build the library — `tsconfig.build.json`

Run `npm run build` and look at `dist/`: no `.d.ts`, and every `import` still
ends in `.tsx` — which Node.js cannot resolve in `dist/`. Add:

- `rootDir: "./src"` — so `dist/` mirrors `src/`
- `declaration: true` — a `.d.ts` next to each `.js`: the props of each
  component, `declare module 'react'` included
- `rewriteRelativeImportExtensions: true` — `./ArticleCard.tsx` becomes `./ArticleCard.js`
- `isolatedDeclarations: true` — every export must carry its types **explicitly**,
  so any tool can write the `.d.ts` file by file, without the checker. Remove the
  `ReactElement` return type of `ArticleCard` for a moment: what does it say?

→ **Done when** the first four `npm run build` specs are green.

### 5. Publish its types — `package.json`

`tests/consumer/` is a React app that imports the library **by its name**,
`tp-react-09-modules`, and `import type`s its props. Node.js finds the
JavaScript through `exports`; TypeScript needs to find the declarations too.
Add a `types` condition — **first**: the conditions are read in order, and the
first one that matches wins.

→ **Done when** `npm test` is green — the consumer spec included.

### 6. *(Bonus)* — a second entry point

Expose `src/Badge.tsx` as `tp-react-09-modules/badge`, with its own `exports`
entry, and import it from `tests/consumer/index.tsx`.

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
- [ ] `style={{ '--badge-colour': … }}` is a compile error
- [ ] `vendor/` and `@types/react` are unchanged
- [ ] `package.json` exposes both the JavaScript and the declarations

**You can explain**

- [ ] What a shorthand ambient module buys you, and what it costs
- [ ] Why `style` can accept a property `@types/react` never heard of — and who
      declares it
- [ ] What `isolatedDeclarations` demands, and which tools it speeds up
- [ ] Where you would look first for the types of a package that ships none —
      before writing them yourself

## Going further

- Search DefinitelyTyped for a package you use: `npm view @types/<name>`. Which
  version of the package does it describe?
- Import a stylesheet — `import styles from './Badge.module.css'` — and read the
  error. Declare `declare module '*.module.css'` in `src/types/`: what type
  should `styles` have? Why does the build still not copy the CSS to `dist/`?
- Switch `module` to `preserve` and `moduleResolution` to `bundler` in
  `tsconfig.json`: which import of the workshop stops being an error — and why
  would Node.js still refuse it?
- Run `npx tsc -p tsconfig.build.json --listEmittedFiles`.
