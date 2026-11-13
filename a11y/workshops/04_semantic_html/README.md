# TP 4 — Semantic HTML

> Turn loose links into a navigation landmark, and a grid of divs into a real data table.

## Goal

Chapter 5 — The right element gives the right role, for free: a screen reader
user can jump to a `<nav>`, hears *"list, 2 items"*, and moves through a
`<table>` cell by cell with its column headers read out. A `<div>` gives none of
that (WCAG 1.3.1 Info and Relationships, level A).

**Files:** `index.html`, `create.html`, `style.css`, `script.js`. The
`TODO workshop 4` comments mark the places. The app starts where workshop 3
ended: the skip link and the focus style are there.

## Setup

```bash
cd workshops/04_semantic_html
npx serve .
```

Before you change anything, open `index.html` with your screen reader: list the
landmarks, then try the *next table* shortcut (T). Nothing.

## Steps

### 1. A navigation landmark

1. In the `<header>` of **both** pages, turn the two links into a menu:

   ```html
   <nav aria-label="Main menu">
     <ul>
       <li><a href="index.html" aria-current="page">Home</a></li>
       <li><a href="create.html">Add a person</a></li>
     </ul>
   </nav>
   ```

   - `<nav>` is a *navigation* landmark. `aria-label` names it: useful as soon as
     a page has more than one (a footer menu, a breadcrumb).
   - The `<ul>` tells how many links there are before going through them.
   - `aria-current="page"` tells which link is the current page. In
     `create.html`, it goes on **"Add a person"** instead, and only on it.

2. In `style.css`, at the `TODO workshop 4`: lay the list out in a row
   (`display: flex; list-style: none;` on `header nav ul`), and show the current
   page **for the eyes** as well:

   ```css
   header nav a[aria-current="page"] {
     font-weight: 700;
     border-bottom: 2px solid white;
   }
   ```

   Styling from the ARIA attribute, rather than an `.active` class, keeps the
   visual and the announced state from ever disagreeing.

### 2. A real data table

1. In `index.html`, replace the grid of `<div class="people" id="people">` with
   a table:

   ```html
   <table>
     <caption>People in the family tree</caption>
     <thead>
       <tr>
         <th scope="col">Last name</th>
         <th scope="col">First name</th>
         <th scope="col">Birth date</th>
       </tr>
     </thead>
     <tbody id="people">
       <!-- Rows rendered by script.js -->
     </tbody>
   </table>
   ```

   - The `<caption>` is the **name** of the table: it is announced when the user
     enters it, and listed in the screen reader's tables list.
   - `scope="col"` says each `<th>` heads a column, so each cell is announced
     with its header.
   - The `id="people"` moves to the `<tbody>`: that is where the rows go.

2. The `.people .row` rules of `style.css` are now dead: remove them. The table
   styles are already in the file.

### 3. Render the rows

In `script.js`, `renderPeople()` still builds `<div>`s. Make it build table rows
into `#people` (the `<tbody>`):

- empty the body first (`replaceChildren()`), then, for each person of the
  `people` array, a `<tr>` with three `<td>`: `lastName`, `firstName`,
  `birthDate`;
- put the birth date in a `<time>` element with a machine-readable `datetime`:

  ```html
  <td><time datetime="1980-05-15">1980-05-15</time></td>
  ```

  The text can be formatted however you like for humans; `datetime` stays
  `YYYY-MM-DD` for machines.

Keep `createElement` and `textContent`: the data goes in as text, never as
HTML.

## Checking your work

**By hand.** With your screen reader: the landmarks list shows a navigation
named *Main menu*; going through it announces a list of 2 items, and the
current page. Press T: the table is announced with its caption, its size, and,
while moving from cell to cell, the column header of each cell.

**From the terminal**, in the training folder:

```bash
pnpm run verify --dir workshops --tp 04
```

(Run `pnpm install` and `pnpm exec playwright install chromium` once before, if
not done yet.) It replays the checks of workshop 3, then checks that, on both
pages:

- there is a navigation landmark named *Main …*;
- its links are list items (exactly 2);
- the current page link (*Home* on `index.html`, *Add a person* on
  `create.html`) has `aria-current="page"`, and it alone;
- that link is visibly marked too: bold (font weight 600 or more).

And on `index.html`:

- a table named by its `<caption>` (the name must contain *people*);
- its column headers have `scope="col"`;
- 5 rows of data;
- the cells are real cells (*Dupont* is one);
- the birth dates are `<time datetime="YYYY-MM-DD">`;
- no `.people .row` grid of `<div>`s is left.

## Going further

**Bonus — a sortable table** (not checked by `verify`). Let the user sort by last
name or first name, ascending and descending:

- put a `<button>` **inside** the sortable `<th>`, and the sort state on the
  `<th>`:

  ```html
  <th scope="col" aria-sort="none">
    <button type="button">Last name</button>
  </th>
  ```

- a `<button>` already handles Enter and Space: no `keydown` to write;
- on click, sort `people`, re-render the rows, and update `aria-sort`
  (`ascending`, `descending`) on that column — and remove it, or set `none`, on
  the other one;
- show the direction visually too (an arrow), hidden from assistive tech with
  `aria-hidden="true"`: `aria-sort` already says it;
- listen to what your screen reader announces when you sort. Some say nothing:
  how would you confirm the new order (hint: a `role="status"` region)?

Other ideas:

- Check the heading outline of both pages (the browser extension *HeadingsMap*,
  or your screen reader's headings list). Is it logical?
- Add a `<th scope="row">` on the last name of each row: what changes in the
  announcements?

## Useful links

- [HTML Living Standard](https://html.spec.whatwg.org/multipage/)
- [MDN — `<nav>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav)
- [MDN — `aria-current`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current)
- [WAI Tutorials — Tables](https://www.w3.org/WAI/tutorials/tables/)
- [APG — Sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
