# TP 13 — Splitting an application

> Optional workshop — chapter 10 (ES Modules). ~1h.
> **Must be served over HTTP** — the command is in *Setup* below.

## Goal

Take a small application that works, in one file, and cut it into **modules** —
without breaking it. Nothing new appears on the screen: what changes is that
each file states what it needs and what it offers.

## Setup

```bash
npx serve chapters/javascript/tp/13_es_modules
# then open the printed http://localhost:3000
```

`index.html` loads `app.js` with `<script type="module">`, and a module is
**fetched**. From a `file://` page the browser refuses it outright:
*"Cross origin requests are only supported for protocol schemes: http, https…"*.
Seeing that error once is part of the workshop.

## Steps

1. **Read what you have** — open the page, add an item, remove one. It works.
   In the Network panel, note that a single file is downloaded. Then, in the
   console, type `plural` — `ReferenceError`: a module does not leak into
   `window`, unlike every script of the previous workshops.
2. **`format.js`** — move `CURRENCY`, `price()` and `plural()` there, export the
   two functions, and import them back into `app.js`:

   ```javascript
   export function price(amount) { /* … */ }        // format.js
   import { price, plural } from './format.js';      // app.js
   ```

   Reload. Network now shows two files. Break it on purpose, three times, and
   read each message: drop the `./`, then drop the `.js`, then import a name
   that is not exported. Those are the three errors you will hit for real.
3. **`store.js`** — move `items` and the four functions around it. Export
   `getItems`, `addItem`, `removeItem` and `total`; leave `items` itself
   **unexported**. The data is now reachable only through the functions — the
   first real benefit of the split.
4. **Loaded once** — add `console.log('store loaded')` at the top level of
   `store.js`, and import `store.js` from `cart-item.js` too (step 5). Reload:
   the line is printed **once**, not twice. A module is evaluated one time per
   page, whoever imports it.
5. **`cart-item.js`** — move `createItem()` there as the **default** export:

   ```javascript
   export default function createItem(item, onChange) { /* … */ }
   import createItem from './cart-item.js';
   ```

   It needs `price` and `removeItem` — import them there. It also needs to
   re-render after a removal: pass `render` in as a parameter rather than
   importing `app.js` back, which would be a circular import.
6. **On demand** — wire the *Statistics* button with a dynamic import:

   ```javascript
   const { summary } = await import('./stats.js');
   ```

   Keep the Network panel open: `stats.js` is downloaded on the **first click**
   and never again. That is how a heavy library stops costing anything to the
   users who never open the feature.

## Checking your work

`check.js` prints its criteria in the console: it looks at which files the
browser actually downloaded, so it can tell whether the split really happened.
`stats.js` must **not** appear before you click.

The cart must still work end to end: add, remove, total.

## Going further

- Put `import { price } from './format.js';` inside the submit handler. Read the
  error: `import` only lives at the top level, and that is what lets the browser
  build the whole graph before running anything.
- `import * as store from './store.js';` — the whole module as one object. When
  is it nicer than five named imports, and when is it worse?
- Try to reassign an import: `price = 3`. `TypeError: Assignment to constant`.
- In the console, type `price` — and get an `<input>`. Every element carrying an
  `id` puts itself on `window`, which has nothing to do with your modules. That
  is why step 1 probed `plural` and not `price`.
- Add `<script type="module">console.log(await fetch('./stats.js'));</script>`
  in the HTML: top-level `await` works in a module, and only in a module.
- Circular import: make `store.js` import something from `cart-item.js`. It does
  not crash, it gives you `undefined` at the wrong moment. Then split the shared
  piece into a third file, which is the actual fix.
