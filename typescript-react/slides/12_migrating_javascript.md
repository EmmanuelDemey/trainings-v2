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
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["vite/client"],
    "strict": true,             // the TypeScript 7 default — said out loud
    "allowJs": true,            // .js and .jsx files are part of the program
    "noEmit": true
  },
  "include": ["src"]
}
```

- `.tsx` files can **import** `.jsx` components — and get their **inferred** props
- Without `allowJs`, a `.jsx` import is a module "without declaration":
  `'./Cart.jsx' implicitly has an 'any' type`
- On its own, `allowJs` **checks nothing** in the JavaScript files: a green
  `tsc` on a JavaScript project means very little

---

# `checkJs` — and `// @ts-check`

```jsonc
"checkJs": true          // every .js file is checked
```

```jsx
// @ts-check                          ← one file at a time, without checkJs
export function Price({ item }) {     // ✘ Binding element 'item' implicitly has an 'any' type.
  return <span>{item.price * item.qty}</span>;
}

export function Quantity() {
  const [qty, setQty] = useState(1);
  return <input value={qty} onChange={(event) => setQty(event.target.value)} />;
  // ✘ Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number>'.
}
```

- The **same** checker as for `.ts`, the same `strict` rules
- `// @ts-nocheck` at the top of a file: the opposite — this file is skipped
- Two strategies:
  - `checkJs` off, `// @ts-check` on the files done — **opt in**
  - `checkJs` on, `// @ts-nocheck` on the files not done yet — **opt out**: a
    list that only shrinks, and `grep` measures the progress

---

# Typing JavaScript with JSDoc

```jsx
/**
 * @typedef {object} Line
 * @property {string} name
 * @property {number} price      In cents.
 * @property {number} [discount] Optional.
 */

/**
 * @param {{ line: Line }} props
 */
export function LineTotal({ line }) {
  return <td>{line.price * (1 - line.discount)}</td>;   // ✘ 'line.discount' is possibly 'undefined'.
}

<LineTotal line={{ name: 'Pen', price: '150' }} />;     // ✘ Type 'string' is not assignable to type 'number'.
```

- The file **stays JavaScript**: no build step, no rename — the props live in comments
- Inside the braces, it is **TypeScript**: unions, generics, `Partial<Line>`…

---

# More JSDoc: `@import`, `@satisfies`

```jsx
/** @import { Line } from './LineTotal.jsx' */      // TypeScript 5.5
/** @import { ReactNode } from 'react' */

/** @param {{ lines: Line[], children?: ReactNode }} props */
export function Cart({ lines, children }) { /* … */ }

<Cart lines={[{ name: 'Pen' }]} />;
// ✘ Property 'price' is missing in type '{ name: string; }' but required in type 'Line'.

/** @satisfies {Record<string, number>} */
export const VAT = { fr: 0.2, de: '19%' };           // ✘ Type 'string' is not assignable to type 'number'.
```

- `@import` brings a **type** in, and nothing at run time — the JSDoc
  `import type`. Before 5.5: `@param {{ lines: import('./LineTotal.jsx').Line[] }} props`
- `@satisfies`, `@template` (generics), `@overload`, `@enum`… — most of the type
  system has a JSDoc spelling
- Some large libraries ship this way — **Svelte** is written in JavaScript with
  JSDoc types, checked by `tsc`

---

# From `.js` to `.ts`, one file at a time

```bash
git mv src/Cart.jsx src/Cart.tsx      # keeps the history of the file
```

```tsx
import { LineTotal, type Line } from './LineTotal.jsx';   // a .jsx file — or a .tsx one

interface CartProps { lines: Line[]; children?: ReactNode }
export function Cart({ lines, children }: CartProps) { … }
```

- The **imports do not change**: an import of `./LineTotal.jsx` finds the
  source, `LineTotal.jsx` or `LineTotal.tsx` — and with `moduleResolution: bundler`,
  `./LineTotal` works too: Vite resolves all three
- Rename in **its own commit**, then type in the next one: `git log --follow`
  and the review both stay readable
- JSDoc types become TypeScript types: `@typedef` → `interface`, `@param {{ … }} props` →
  a `Props` interface. Keep the descriptions as **TSDoc**

---

# `@ts-expect-error`, not `@ts-ignore`

```tsx
// @ts-ignore
<Avatar size="big" />;              // silenced — today, and forever

// @ts-expect-error — the API sends a string, fixed in #142
<Avatar size={user.size} />;        // silenced — as long as there is an error

// @ts-expect-error
<Avatar size={48} />;               // ✘ Unused '@ts-expect-error' directive.

<div>
  {/* @ts-expect-error — inside JSX, the comment goes in braces */}
  <Avatar size={user.size} />
</div>
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

```tsx
// types/CartLine.d.ts — written by tsc, from the JSDoc of src/CartLine.jsx
/** @param {{ line: Line }} props */
export declare function CartLine({ line }: { line: Line }): import("react").JSX.Element;
```

- A JavaScript component library can ship **real** types without a single
  `.tsx` file — point `"types"` in `package.json` at them
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
- **CommonJS** still works: a `.cjs` file — an old `webpack.config.js`, a
  `jest.config.cjs` — is checked as CommonJS, `require` and `module.exports` included
- `esModuleInterop` is **always on**: `import React from 'react'`, not
  `import * as React` — and with `"jsx": "react-jsx"`, no `import React` at all
- `types` is **empty** by default: add `"types": ["vite/client"]`, or every
  `import.meta.env` and `import logo from './logo.svg'` is an error

---
src: ../../typescript-common/slides/12_migrating_javascript/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 12 - Migrating JavaScript
