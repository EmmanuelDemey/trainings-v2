---
layout: cover
---

# 12 - Migrating a JavaScript project

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Plan** a migration that ships every day — no "big rewrite" branch
- **Check** JavaScript files with `allowJs` and `checkJs`, or one file at a time with `// @ts-check`
- **Type** JavaScript without converting it, with **JSDoc**
- **Convert** a file from `.js` to `.ts`, one at a time
- **Silence** an error on purpose with `@ts-expect-error` — and know why not `@ts-ignore`
- **Turn on** `strict` step by step, and **ship** `.d.ts` files from JavaScript

---

# A migration, not a rewrite

- JavaScript **is** TypeScript: every `.js` file can stay as it is, next to the `.ts` ones
- Migrate **incrementally**: every step builds, passes the tests, and ships

<br />

1. Add `typescript` and a `tsconfig.json` — `allowJs`, nothing checked yet
2. Let the checker **read** the JavaScript: `checkJs`, or `// @ts-check` file by file
3. Type the **leaves** first — the modules everything else imports
4. Rename `.js` to `.ts` where it pays: new code, code that changes often
5. Tighten the compiler — `strict`, then the flags beyond it

<br />

> The goal is not "zero `.js` files". It is **every file checked**.

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

# `strict`, step by step

- **TypeScript 7** turns `strict` on **by default**: an old project that never
  set it gets every check at once. Say `"strict": false` explicitly while you migrate
- Then flag by flag — the order of the most value for the least work:

| Step | Flag | What it finds |
|---|---|---|
| 1 | `noImplicitAny` | Every untyped parameter — the bulk of the work |
| 2 | `strictNullChecks` | Every `null` / `undefined` not handled — the bugs |
| 3 | `strict: true` | The rest of the family: `strictFunctionTypes`, `useUnknownInCatchVariables`… |
| 4 | Beyond | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (chapter 10) |

- Per **folder** instead of per flag: one `tsconfig.json` per package, wired with
  **project references** — the new packages strict from day one

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

# Quiz — Question 1 / 3

**A project has `"allowJs": true`, and `npx tsc --noEmit` is green. What does
that say about its `.js` files?**

- **A.** They are free of type errors
- **B.** Nothing: `allowJs` adds them to the program, it does not check them
- **C.** They have been converted to TypeScript
- **D.** They are only checked when `strict` is on

<v-click>

> ✅ **B** — `allowJs` lets `.ts` files import them, with their inferred types.
> **Checking** them takes `checkJs` — or a `// @ts-check` at the top of each file.

</v-click>

---

# Quiz — Question 2 / 3

**Why prefer `// @ts-expect-error` to `// @ts-ignore`?**

- **A.** `@ts-ignore` does not work in `.js` files
- **B.** `@ts-expect-error` is an error when the line below has **no** error
- **C.** `@ts-expect-error` also checks the type at run time
- **D.** `@ts-ignore` silences the whole file

<v-click>

> ✅ **B** — *Unused '@ts-expect-error' directive*. When the bug is fixed, the
> comment has to go: the debt cannot outlive its reason. `@ts-ignore` stays
> silent forever — even over the next error, the one nobody saw.

</v-click>

---

# Quiz — Question 3 / 3

**`src/format.js` becomes `src/format.ts`, in a `module: nodenext` project.
What happens to `import { formatPrice } from './format.js'` in the other files?**

- **A.** It must become `'./format.ts'`
- **B.** It must become `'./format'`
- **C.** Nothing: the import names the emitted file, `format.js`
- **D.** It must become `import type`

<v-click>

> ✅ **C** — `tsc` maps `./format.js` back to `format.ts`. Renaming one file does
> not ripple through the project: that is what makes a file-by-file migration
> possible.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 12 - Migrating JavaScript
