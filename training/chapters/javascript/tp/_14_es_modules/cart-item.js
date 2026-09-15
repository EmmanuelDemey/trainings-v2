// Step 5 — one element, one module.
//
// TODO: move createItem() here and make it the DEFAULT export:
//   export default function createItem(item) { ... }
// In app.js:  import createItem from './cart-item.js';
//
// It needs price() from ./format.js and removeItem() from ./store.js — a module
// imports whatever it needs, wherever it is used from.
//
// The re-render after a removal is the awkward part: pass render as a second
// parameter — createItem(item, render) — rather than importing app.js back.
