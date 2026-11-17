---
layout: cover
---

# 12 - Migrating a JavaScript project

---
src: ../../typescript-common/slides/12_migrating_javascript/learning-objectives.md
---

---
src: ../../typescript-common/slides/12_migrating_javascript/a-migration-not-a-rewrite.md
---

---

# `allowJs` — JavaScript in the program

```jsonc
{
  "compilerOptions": {
    "module": "nodenext",
    "types": ["node"],
    "strict": true,             // the TypeScript 7 default — said out loud
    "allowJs": true,            // .js files are part of the program
    "noEmit": true
  },
  "include": ["src"]
}
```

- `.ts` files can **import** `.js` files — and get their **inferred** types
- Without `allowJs`, a `.js` import is a module "without declaration":
  `implicitly has an 'any' type`
- On its own, `allowJs` **checks nothing** in the JavaScript files: a green
  `tsc` on a JavaScript project means very little

---

# `checkJs` — and `// @ts-check`

```jsonc
"checkJs": true          // every .js file is checked
```

```js
// @ts-check                     ← one file at a time, without checkJs
export function price(item) {    // ✘ Parameter 'item' implicitly has an 'any' type.
  return item.price * item.qty;
}
document.title = price(item);    // ✘ Type 'number' is not assignable to type 'string'.
```

- The **same** checker as for `.ts`, the same `strict` rules
- `// @ts-nocheck` at the top of a file: the opposite — this file is skipped
- Two strategies:
  - `checkJs` off, `// @ts-check` on the files done — **opt in**
  - `checkJs` on, `// @ts-nocheck` on the files not done yet — **opt out**: a
    list that only shrinks, and `grep` measures the progress

---

# Typing JavaScript with JSDoc

```js
/**
 * @typedef {object} Line
 * @property {string} name
 * @property {number} price      In cents.
 * @property {number} [discount] Optional.
 */

/**
 * @param {Line} line
 * @returns {number}
 */
export function total(line) {
  return line.price * (1 - line.discount);   // ✘ 'line.discount' is possibly 'undefined'.
}

/** @type {Line[]} */
const lines = [];
lines.push({ name: 'Pen', price: '150' });   // ✘ Type 'string' is not assignable to type 'number'.
```

- The file **stays JavaScript**: no build step, no rename — the types live in comments
- Inside the braces, it is **TypeScript**: unions, generics, `Partial<Line>`…

---

# More JSDoc: `@import`, `@satisfies`

```js
/** @import { Line } from './order.js' */            // TypeScript 5.5

/** @param {Line[]} lines */
export function count(lines) { return lines.length; }

count([{ name: 'Pen' }]);
// ✘ Property 'price' is missing in type '{ name: string; }' but required in type 'Line'.

/** @satisfies {Record<string, number>} */
export const VAT = { fr: 0.2, de: '19%' };           // ✘ Type 'string' is not assignable to type 'number'.
```

- `@import` brings a **type** in, and nothing at run time — the JSDoc
  `import type`. Before 5.5: `@param {import('./order.js').Line[]} lines`
- `@satisfies`, `@template` (generics), `@overload`, `@enum`… — most of the type
  system has a JSDoc spelling
- Some large libraries ship this way — **Svelte** is written in JavaScript with
  JSDoc types, checked by `tsc`

---

# From `.js` to `.ts`, one file at a time

```bash
git mv src/format.js src/format.ts      # keeps the history of the file
```

```ts
import { lineTotal, type Line } from './cart.js';   // a .js file — or a .ts one

export function formatPrice(cents: number): string { … }
```

- The **imports do not change**: with `module: nodenext`, an import names the
  **emitted** file, `./cart.js` — whether its source is `cart.js` or `cart.ts`
  (or name the source, `./cart.ts`, with `rewriteRelativeImportExtensions`)
- Rename in **its own commit**, then type in the next one: `git log --follow`
  and the review both stay readable
- JSDoc types become TypeScript types: `@typedef` → `interface`, `@param` →
  annotations. Keep the descriptions as **TSDoc**

---

# `@ts-expect-error`, not `@ts-ignore`

```ts
// @ts-ignore
const a: number = 'one';      // silenced — today, and forever

// @ts-expect-error — the API sends a string, fixed in #142
const b: number = 'two';      // silenced — as long as there is an error

// @ts-expect-error
const c: number = 3;          // ✘ Unused '@ts-expect-error' directive.
```

- Both silence the **next line**. `@ts-expect-error` **fails** when the error is gone
- A migration leaves debts behind: make them **visible** and **temporary** —
  `@ts-expect-error` plus a reason, and a `grep` in the CI to count them
- typescript-eslint's `ban-ts-comment` forbids `@ts-ignore`, and asks for a description

---
src: ../../typescript-common/slides/12_migrating_javascript/strict-step-by-step.md
---

---

# Shipping types from JavaScript

```jsonc
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "declaration": true,
    "emitDeclarationOnly": true,     // only the .d.ts — the .js are already there
    "rootDir": "src",                // TypeScript 7: required to emit from src/
    "outDir": "types"
  },
  "include": ["src"]
}
```

```ts
// types/format.d.ts — written by tsc, from the JSDoc of src/format.js
/** @param {number} cents @returns {string} */
export declare function formatPrice(cents: number): string;
```

- A JavaScript package can ship **real** types without a single `.ts` file —
  point `"types"` in `package.json` at them
- The JSDoc has to be **complete**: what is not typed comes out as `any`

---

# Pitfalls

- **Options removed in TypeScript 7** — an old `tsconfig.json` no longer loads:

```text
error TS5102: Option 'baseUrl' has been removed. Please remove it from your configuration.
error TS5108: Option 'moduleResolution=node10' has been removed.
error TS5108: Option 'esModuleInterop=false' has been removed.
```

- Move those prefixes into `paths`; `moduleResolution` becomes `nodenext`
  (Node.js) or `bundler`; `target: es5` and `outFile` are gone too — a
  bundler's job now
- **CommonJS** still works: a `.cjs` file, or a package without `"type": "module"`,
  is checked as CommonJS — `require` and `module.exports` included
- `esModuleInterop` is **always on**: `import express from 'express'`, not
  `import * as express`
- `types` is **empty** by default: add `"types": ["node"]`, or every `process`
  is an error

---
src: ../../typescript-common/slides/12_migrating_javascript/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 12 - Migrating JavaScript
