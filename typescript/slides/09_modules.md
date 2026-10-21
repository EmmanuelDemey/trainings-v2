---
layout: cover
---

# 9 - Modules & declaration files

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Import** values and types between ES modules, and tell `import` from
  `import type`
- **Choose** a `module` / `moduleResolution` for Node.js or for a bundler
- **Write** a declaration file for a JavaScript package that ships no types
- **Extend** a type you do not own: module augmentation, `declare global`
- **Ship** a package with its declarations: `declaration`, `isolatedDeclarations`,
  `exports` and `types`

---

# ES modules — the only module system to write

```ts
// articles.ts
export interface Article { title: string; slug: string }
export function publish(title: string): Article { /* … */ }
export default class Blog { /* … */ }
```

```ts
// index.ts
import Blog, { publish, type Article } from './articles.ts';
import * as articles from './articles.ts';

export { publish } from './articles.ts';
export type { Article } from './articles.ts';
```

- **One file = one module**: a file with an `import` or an `export` has its own scope
- A file with neither is a **script**: its declarations are **global**
- `namespace` and `require` still compile — new code does not need them

---

# `import type` and `verbatimModuleSyntax`

```ts
import { publish } from './articles.ts';
import type { Article } from './articles.ts';
import { emit, type EventMap } from './events.ts';
```

- A type-only import **disappears** at compile time; a value import stays
- **`verbatimModuleSyntax: true`**: what is not marked `type` is **kept** as is
  - the output is predictable, file by file
  - an `import { Article }` of a type only is an **error**: mark it `type`
- Required by tools that compile one file at a time: **Node.js type stripping**,
  esbuild, swc, Vite — they cannot know `Article` is a type

---

# `module` and `moduleResolution`

| Target | `module` | Imports look like |
|---|---|---|
| **Node.js** (code that runs as is, libraries) | `nodenext` | `'./articles.ts'`, `'./articles.js'` — the extension is **required** |
| **A bundler** (Vite, webpack, esbuild) | `preserve` (+ `moduleResolution: bundler`) | `'./articles'` — no extension needed |

- `nodenext` follows Node.js's rules: ESM or CommonJS from `"type"` in
  `package.json` and the extension (`.mts`, `.cts`)
- `bundler` is more lenient — and lets through imports Node.js would refuse
- Pick the one that matches **what runs the code**, not the most lenient one

---

# Importing `.ts` files

```ts
import { publish } from './articles.ts';
```

- **`allowImportingTsExtensions`** — lets you write `.ts`: what Node.js type
  stripping, tsx, Deno, Bun and bundlers run directly
  - only with `noEmit` … or with:
- **`rewriteRelativeImportExtensions`** — `tsc` rewrites `./articles.ts` into
  `./articles.js` in the emitted JavaScript
- **`erasableSyntaxOnly`** — refuses what type stripping cannot run:
  `enum`, `namespace` with values, parameter properties, decorators

```ts
// ❌ under erasableSyntaxOnly
enum Status { Draft, Published }
class Blog { constructor(private store: Store) {} }
```

---

# `package.json` — `exports` and `types`

```json
{
  "name": "blog",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./events": {
      "types": "./dist/events.d.ts",
      "default": "./dist/events.js"
    }
  }
}
```

- `exports` lists the **only** entry points: `blog/dist/articles.js` is no
  longer importable
- Conditions are read **in order**: `types` comes **first**
- Without `exports`: the older `"types"` / `"main"` fields

---

# Declaration files — `.d.ts`

```ts
// slugify.d.ts — declarations only, no code
export interface SlugifyOptions {
  separator?: string;
  maxLength?: number;
}

export declare const VERSION: string;
export declare function slugify(input: string, options?: SlugifyOptions): string;
```

- What `tsc --declaration` emits next to each `.js`: the **public shape** of a module
- Also what you write by hand for JavaScript that has none
- `declare`: "this exists at run time, trust me" — the checker cannot verify it

---

# Where do types come from?

1. The package **ships them** — `"types"` in its `package.json`, or `.d.ts`
   files next to its `.js`
2. **DefinitelyTyped** — a community repository, published as `@types/<name>`

```bash
npm install --save-dev @types/node @types/express
```

3. **You** write them — an ambient module, in a `.d.ts` of your project

```ts
// src/types/slugify-lite.d.ts
declare module 'slugify-lite' {
  export function slugify(input: string, options?: { maxLength?: number }): string;
}

// Quick and dirty: everything is `any`
declare module 'legacy-lib';
```

---

# Declaring what is not a module

```ts
// Files imported by a bundler
declare module '*.svg' {
  const url: string;
  export default url;
}

// A global set by the host page
declare global {
  var APP_VERSION: string;
  interface Window { analytics: Analytics }
}
export {};
```

- `declare global` is only allowed in a **module**: hence the `export {}`
- `var`, not `let` / `const`: only `var` lands on `globalThis`
- `types` in `tsconfig.json` restricts which `@types` packages are loaded
  globally: `"types": ["node"]`

---

# Interface merging & module augmentation

```ts
// events.ts — you own it, or not
export interface EventMap {}
export function emit<Name extends keyof EventMap>(name: Name, payload: EventMap[Name]): void;
```

```ts
// articles.ts — adds its own events
declare module './events.ts' {
  interface EventMap {
    'article:published': { slug: string; title: string };
  }
}

emit('article:published', { slug: 'hello', title: 'Hello' });   // ✅
emit('article:deleted', { slug: 'hello' });                      // ❌
```

- Two `interface` declarations with one name **merge** — a `type` alias never does
- How libraries let you extend them: Vue's `ComponentCustomProperties`, Express's
  `Request`, Pinia, i18n keys…

---

# Shipping a library

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "isolatedDeclarations": true,
    "rewriteRelativeImportExtensions": true
  }
}
```

- `declarationMap` — "Go to definition" lands in the `.ts` source, not the `.d.ts`
- **`isolatedDeclarations`** — every export carries **explicit** types

```ts
export function publish(title: string) { /* … */ }            // ❌ return type?
export function publish(title: string): Article { /* … */ }   // ✅
```

- … so any tool can emit the `.d.ts` **file by file**, in parallel, without the checker

---

# Quiz — Question 1 / 3

**Under `verbatimModuleSyntax`, `Article` is an interface. Which import compiles?**

- **A.** `import { Article } from './articles.ts';`
- **B.** `import { type Article } from './articles.ts';`
- **C.** `import Article from './articles.ts';`
- **D.** All three

<v-click>

> ✅ **B** — Under `verbatimModuleSyntax`, an import not marked `type` is kept in
> the JavaScript — and `Article` does not exist at run time. `import type { Article }`
> works as well.

</v-click>

---

# Quiz — Question 2 / 3

**A package ships no types and has no `@types`. What does
`declare module 'legacy-lib';` give you?**

- **A.** Types generated from the package's JavaScript
- **B.** An error until you list every export
- **C.** An import that compiles — with everything it exports typed `any`
- **D.** A type check at run time

<v-click>

> ✅ **C** — A **shorthand** ambient module silences the error, and switches the
> checker off for that package. A first step — then describe what you use, with a
> `declare module 'legacy-lib' { … }` block.

</v-click>

---

# Quiz — Question 3 / 3

**A library declares `export interface Theme {}`. How do you add a `brand`
color to it, from your code?**

- **A.** `type Theme = Theme & { brand: string }`
- **B.** `declare module 'the-lib' { interface Theme { brand: string } }`
- **C.** Fork the library
- **D.** `declare global { interface Theme { brand: string } }`

<v-click>

> ✅ **B** — **Module augmentation**: the two `interface Theme` declarations merge.
> **A** creates a new type nobody else uses; **D** declares a different, global
> `Theme`.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 9 - Modules & declaration files
