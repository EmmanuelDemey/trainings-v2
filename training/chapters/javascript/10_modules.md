---
layout: cover
---

# 10 - ES Modules

<div style="opacity: 0.75; font-size: 0.9em">Optional module — ~1h30 with its workshop</div>

---

# The problem: one page, one environment

```html
<script src="cart.js" defer></script>
<script src="app.js" defer></script>
```

```javascript
// cart.js
const total = 0;              // top level = global

// app.js
const total = computeTotal(); // 💥 Identifier 'total' has already been declared
```

- Every classic `<script>` shares **the same global scope**
- The **order** of the tags is a dependency graph nobody wrote down
- Anyone can overwrite anything — and a name collision only shows up at runtime

> The workarounds have names: IIFE, namespaces, AMD, CommonJS. Modules ended
> the debate: they are in the language since **ES2015**, in browsers since 2017.

---

# `export` / `import`

```javascript
// format.js — the module exports what it chooses
export const CURRENCY = 'EUR';

export function price(amount) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: CURRENCY })
    .format(amount);
}

function internal() {}   // not exported ➜ invisible from the outside
```

```javascript
// app.js
import { price, CURRENCY } from './format.js';

price(12.5); // '12,50 €'
```

- Everything is **private by default**; `export` is the public surface
- The names are **checked when the file loads**: a typo in an `import` is an
  error before a single line runs

---

# Named, default, and the rest

```javascript
import { price, CURRENCY } from './format.js';   // named — the usual case
import { price as formatPrice } from './format.js';   // renamed
import * as format from './format.js';           // everything, as an object

export default function Cart() {}                // ONE default per module
import Cart from './cart.js';                    // no braces, any name you like
```

- `./format.js` — the **extension is required**, and so is the `./`
- Prefer **named** exports: the name is checked, and searchable in the project
- The imported binding is **read-only**: `price = 3` is a `TypeError`

> Every `import` must sit at the **top level** of the file, never in an `if` or
> in a function. That is what lets the browser fetch the graph up front.

---

# `<script type="module">`

```html
<script type="module" src="app.js"></script>
```

- Only `app.js` is declared: it `import`s the rest, the browser downloads it
- A module is **deferred by default** — no `defer` attribute needed
- It runs in **strict mode**, and its top level is **not** `window`
- It can `await` at the top level

```javascript
// app.js — legal in a module, illegal in a classic script
const response = await fetch('data/products.json');
```

> ⚠️ A module is fetched, so `file://` refuses it: *"Cross origin requests are
> only supported for http, https"*. Run `npx serve` from now on.

---

# One module, loaded once

```javascript
// store.js
export const state = { items: [] };
console.log('store loaded');
```

```javascript
// app.js
import { state } from './store.js';
import './cart.js';        // cart.js also imports ./store.js
// 'store loaded' is printed ONCE
```

- A module is evaluated **once per page**, whoever imports it and however often
- Everyone shares the same exported objects — a natural single shared state
- Circular imports resolve, but the second module sees the first half-built:
  if you need a diagram to explain the flow, split the file instead

---

# Loading on demand

```javascript
button.addEventListener('click', async () => {
  const { renderChart } = await import('./chart.js');  // downloaded NOW
  renderChart(data);
});
```

- `import(...)` is a **function call** returning a promise — it may live inside
  a condition, a handler, anywhere
- The 200 kB chart library is not downloaded by the 90% who never click
- Same file, same module cache: a second click downloads nothing

---

# What comes after

| | What it adds |
|---|---|
| **npm** | `import { z } from 'zod'` — a name, not a path |
| **A bundler** (Vite, esbuild) | one optimised file, `.ts` / `.jsx` compiled |
| **Import maps** | map a bare name to a URL, with no build step |

```html
<script type="importmap">
  { "imports": { "lodash": "https://cdn.jsdelivr.net/npm/lodash-es/lodash.js" } }
</script>
```

- Today's browsers run modules **natively**: for a small project, no build step
- The tooling of a framework starts here — and nowhere else

---

# Hands-on

## Workshop 13 - Splitting an application

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/13_es_modules/</code> — ⏱ ~1h — <b>run it with <code>npx serve</code></b>, steps in its <code>README.md</code></div>

- Split a working single-file app into `format.js`, `store.js` and `app.js`
- Export named functions, import them, make the page work again
- Prove that a module is only evaluated once
- Add a default export, and load a module on demand with `import(...)`
- Read the errors: a missing `./`, a missing `.js`, a name that is not exported
