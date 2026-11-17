---
layout: cover
---

# 9 - Modules & declaration files

---
src: ../../typescript-common/slides/09_modules/learning-objectives.md
---

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
src: ../../typescript-common/slides/09_modules/module-and-moduleresolution.md
---

---

# `require(esm)`, side effects, `#/` imports

```ts
// report.cts — CommonJS, under module: nodenext (5.8)
const { publish } = require('./articles.js');   // ✔ an ES module, loaded synchronously
                                                // (no top-level await in it)

import './polyfills.ts';     // checked since 5.6: the file must exist
import './theme.css';       // ✘ Cannot find module or type declarations for side-effect import of './theme.css'.
```

```json
// package.json — subpath imports: private aliases, resolved by Node.js itself
{ "imports": { "#/*": "./src/*" } }
```

```ts
import { publish } from '#/articles.ts';
```

- **`noUncheckedSideEffectImports`** is **on by default** since TypeScript 6:
  declare `declare module '*.css';` for files a bundler handles
- `#/…` replaces most `paths` aliases — and needs no bundler

---

# `import defer` — load now, run later (5.9)

```ts
import defer * as charts from './charts.ts';   // fetched and parsed — not evaluated

export function renderDashboard() {
  return charts.render();   // ← charts.ts (and its imports) run here, on first access
}
```

- Cuts start-up time when a heavy module is needed only on some paths
- Only `import defer * as ns`: no named or default import
- Only under **`module: esnext` or `preserve`** — and the runtime or bundler must
  support it (TC39 stage 3)

---

# Gone in TypeScript 7

Deprecated in 6.0, **removed** in 7.0 — `tsc` refuses the config:

| Option | Instead |
|---|---|
| `moduleResolution: "node"` / `"node10"` / `"classic"` | `nodenext`, or `bundler` |
| `baseUrl` | `paths` with full paths: `"@app/*": ["./src/app/*"]` — or `#/` imports |
| `module: "amd"` / `"umd"` / `"system"` / `"none"`, `outFile` | a bundler |
| `target: "es5"`, `downlevelIteration` | `es2015`+, or a bundler that downlevels |
| `esModuleInterop: false`, `allowSyntheticDefaultImports: false` | always on: `import express from 'express'` |
| `import data from './x.json' assert { … }` | `with { type: 'json' }` |

```txt
error TS5102: Option 'baseUrl' has been removed. Please remove it from your configuration.
```

- Upgrade through **6.0** first: fix every deprecation, turn on `--stableTypeOrdering`
- The experimental **`ts5to6`** tool rewrites `baseUrl` and `rootDir` for you

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
src: ../../typescript-common/slides/09_modules/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 9 - Modules & declaration files
