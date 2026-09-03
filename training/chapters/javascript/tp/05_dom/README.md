# TP 5 — Manipulating the page

> Autonomous workshop — chapter 5 (The DOM). ~1h.

## Goal

Select, read, modify, create and remove elements. By the end of this workshop
you can turn **an array of data into a piece of interface** — the single most
useful skill of the whole training.

Events are chapter 6: the two `onClick(...)` wirings are given in `ui.js`. Only
what happens *inside* them is yours.

## Setup

Open `index.html`, console visible.

## Steps

1. **Select and read** — grab the `<h1>` and log its `textContent`. Then change
   it to `My store`.
2. **`null` is the trap** — `document.querySelector('#nope')` returns `null`,
   not an error. Log it, then try to read `.textContent` on it and read the
   crash message. This is the error you will hit most often this week.
3. **Count** — log how many `.item` the page contains
   (`querySelectorAll(...).length`), and log the text of each with `forEach`.
4. **Show / hide** — the *Details* button must toggle the `hidden` class on
   `#panel`. One line, with `classList.toggle`.
5. **An attribute** — make `#doc-link` point at `https://developer.mozilla.org`
   and open in a new tab (`target="_blank"`, plus `rel="noopener"`).
6. **Render an array** — the `products` array must become `<li>` elements inside
   `#products`: the name, the price, and a *Remove* button. Use
   `createElement` + `append`, never `innerHTML`.
7. **Remove** — a click on a *Remove* button removes its `<li>` from the page.
8. **Keep the summary honest** — after any render or removal, `#summary` shows
   `N product(s), total XX.XX €`. Write **one** `updateSummary()` function and
   call it from both places — do not duplicate the computation.

## Checking your work

The list shows 4 products, the summary matches, removing a line updates the
summary, and the *Details* button hides and shows the panel.

## Going further

- Replace your `createElement` block with `innerHTML` and a template string.
  It is shorter. Now add a product named `<img src=x onerror="alert(1)">` and
  reload. That is XSS, in three lines, in your own page.
- `element.closest('li')`, `element.parentElement`, `element.children` — navigate
  the tree instead of re-querying from `document`.
- `document.createDocumentFragment()` — why building 1000 rows in a fragment and
  appending once beats 1000 `append` calls.
- `<template>` + `cloneNode(true)`: the third way to build DOM, the one
  frameworks are built on.
- **The other selectors** — redo step 1 with `document.getElementById('panel')`
  and step 3 with `document.getElementsByClassName('item')`. Then:

  ```javascript
  const items = document.getElementsByClassName('item'); // live collection
  console.log(items.length);          // 3
  document.querySelector('.item').remove();
  console.log(items.length);          // 2 — nobody touched `items`
  items.forEach;                      // undefined — it is not a NodeList
  ```

  Now remove all of them with `for (const item of items) item.remove()` and
  count what is left. Then fix it with `[...items]`.
