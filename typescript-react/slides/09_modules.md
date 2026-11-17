---
layout: cover
---

# 9 - Modules & declaration files

---
src: ../../typescript-common/slides/09_modules/learning-objectives.md
---

---

# ES modules — the only module system to write

```tsx
// ArticleCard.tsx
export interface ArticleCardProps { title: string; slug: string }
export function ArticleCard({ title, slug }: ArticleCardProps) { /* … */ }
export default function ArticleList({ items }: { items: ArticleCardProps[] }) { /* … */ }
```

```tsx
// index.ts
import ArticleList, { ArticleCard, type ArticleCardProps } from './ArticleCard.tsx';
import * as cards from './ArticleCard.tsx';

export { ArticleCard } from './ArticleCard.tsx';
export type { ArticleCardProps } from './ArticleCard.tsx';
```

- **One file = one module**: a file with an `import` or an `export` has its own scope
- A file with neither is a **script**: its declarations are **global**
- `namespace` and `require` still compile — new code does not need them

---

# `import type` and `verbatimModuleSyntax`

```tsx
import { ArticleCard } from './ArticleCard.tsx';
import type { ArticleCardProps } from './ArticleCard.tsx';
import { useState, type ReactNode, type ChangeEvent } from 'react';
```

- A type-only import **disappears** at compile time; a value import stays
- **`verbatimModuleSyntax: true`**: what is not marked `type` is **kept** as is
  - the output is predictable, file by file
  - an `import { ArticleCardProps }` of a type only is an **error**: mark it `type`
- Required by tools that compile one file at a time: **Node.js type stripping**,
  esbuild, swc, Vite — they cannot know `ArticleCardProps` is a type

---
src: ../../typescript-common/slides/09_modules/module-and-moduleresolution.md
---

---

# `require(esm)`, side effects, `#/` imports

```ts
// render.cts — CommonJS, under module: nodenext (5.8)
const { ArticleCard } = require('./ArticleCard.js');   // ✔ an ES module, loaded synchronously
                                                       // (no top-level await in it)

import './polyfills.ts';    // checked since 5.6: the file must exist
import './theme.css';       // ✘ Cannot find module or type declarations for side-effect import of './theme.css'.
```

```json
// package.json — subpath imports: private aliases, resolved by Node.js itself
{ "imports": { "#/*": "./src/*" } }
```

```tsx
import { ArticleCard } from '#/components/ArticleCard.tsx';
```

- **`noUncheckedSideEffectImports`** is **on by default** since TypeScript 6:
  declare `declare module '*.css';` for files a bundler handles
- `#/…` replaces most `paths` aliases — and needs no bundler

---

# `import defer` — load now, run later (5.9)

```tsx
import defer * as charts from './charts.tsx';   // fetched and parsed — not evaluated

export function Dashboard() {
  return charts.render();   // ← charts.tsx (and its imports) run here, on first access
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
| `baseUrl` | `paths` with full paths: `"@/*": ["./src/*"]` — or `#/` imports |
| `module: "amd"` / `"umd"` / `"system"` / `"none"`, `outFile` | a bundler |
| `target: "es5"`, `downlevelIteration` | `es2015`+, or a bundler that downlevels |
| `esModuleInterop: false`, `allowSyntheticDefaultImports: false` | always on: `import React from 'react'` |
| `import data from './x.json' assert { … }` | `with { type: 'json' }` |

```txt
error TS5102: Option 'baseUrl' has been removed. Please remove it from your configuration.
```

- Upgrade through **6.0** first: fix every deprecation, turn on `--stableTypeOrdering`
- The experimental **`ts5to6`** tool rewrites `baseUrl` and `rootDir` for you

---

# Importing `.ts` files

```tsx
import { ArticleCard } from './ArticleCard.tsx';
```

- **`allowImportingTsExtensions`** — lets you write `.ts` / `.tsx`: what Node.js
  type stripping, tsx, Deno, Bun and bundlers run directly
  - only with `noEmit` … or with:
- **`rewriteRelativeImportExtensions`** — `tsc` rewrites `./ArticleCard.tsx` into
  `./ArticleCard.js` in the emitted JavaScript
- **`erasableSyntaxOnly`** — refuses what type stripping cannot run:
  `enum`, `namespace` with values, parameter properties, decorators

```tsx
// ❌ under erasableSyntaxOnly
enum Variant { Primary, Secondary }
class ArticleService { constructor(private api: ApiClient) {} }
```

---

# `package.json` — `exports` and `types`

```json
{
  "name": "@acme/ui",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./badge": {
      "types": "./dist/Badge.d.ts",
      "default": "./dist/Badge.js"
    }
  },
  "peerDependencies": { "react": "^19.0.0" }
}
```

- `exports` lists the **only** entry points: `@acme/ui/dist/ArticleCard.js` is no
  longer importable
- Conditions are read **in order**: `types` comes **first**
- Without `exports`: the older `"types"` / `"main"` fields

---

# Declaration files — `.d.ts`

```tsx
// Badge.d.ts — declarations only, no code
import type { ReactElement, ReactNode } from 'react';

export interface BadgeProps {
  color: string;
  children: ReactNode;
}

export declare const VERSION: string;
export declare function Badge(props: BadgeProps): ReactElement;
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
npm install --save-dev @types/react @types/react-dom
```

3. **You** write them — an ambient module, in a `.d.ts` of your project

```tsx
// src/types/react-legacy-datepicker.d.ts
declare module 'react-legacy-datepicker' {
  import type { ReactElement } from 'react';
  export default function DatePicker(props: { value: Date | null; onChange(value: Date | null): void }): ReactElement;
}

// Quick and dirty: everything is `any`
declare module 'legacy-lib';
```

---

# Declaring what is not a module

```tsx
// Files imported by a bundler
declare module '*.svg' {
  const url: string;
  export default url;
}
declare module '*.module.css' {
  const classes: { readonly [name: string]: string };
  export default classes;
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
  globally: `"types": ["vite/client"]` declares `*.svg` and `*.module.css` for you

---

# Interface merging & module augmentation

```tsx
// @types/react — you do not own it
export interface CSSProperties extends CSS.Properties<string | number> {}
```

```tsx
// Badge.tsx — adds its own custom property
declare module 'react' {
  interface CSSProperties {
    '--badge-color'?: string;
  }
}

<span style={{ '--badge-color': color }} />    // ✅
<span style={{ '--badge-colour': color }} />   // ❌
```

- Two `interface` declarations with one name **merge** — a `type` alias never does
- How libraries let you extend them: `JSX.IntrinsicElements` for a web component,
  MUI's `Palette`, styled-components' `DefaultTheme`, React Router, i18n keys…

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

- `declarationMap` — "Go to definition" lands in the `.tsx` source, not the `.d.ts`
- **`isolatedDeclarations`** — every export carries **explicit** types

```tsx
export function Badge({ color, children }: BadgeProps) { /* … */ }                 // ❌ return type?
export function Badge({ color, children }: BadgeProps): ReactElement { /* … */ }   // ✅
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
