# TP 7 — Complex components: a modal dialog

> Open the details of a person in a modal dialog: focus moved in, trapped inside, and given back on close.

## Goal

Chapter 8 — A modal dialog is the complex component you will build most often,
and the one most often broken. For a keyboard and screen reader user, it must:

- **say what it is**: a dialog, modal, with a name (WCAG 4.1.2, A);
- **take the focus** when it opens, and **keep it** inside while open (2.4.3
  Focus Order, A);
- make the page behind **unreachable and unreadable**;
- **close** with Escape, its close buttons, and a click outside;
- **give the focus back** to the button that opened it (2.4.3).

Each row of the table also gets a button whose name says **which** person it is
about (2.4.4 Link Purpose, A; 2.5.3 Label in Name, A).

**Files:** `index.html`, `style.css`, `script.js`. The `TODO workshop 7`
comments mark the places. The styles of `.modal`, `.modal-overlay` and
`.close-btn` are already in `style.css`: they are shown with the **`is-open`**
class. The app starts where workshop 6 ended.

## Setup

```bash
cd workshops/07_modal
npx serve .
```

## Steps

### 1. The markup of the dialog

In `index.html`, where the TODO is, before `</body>` (and the script), add:

```html
<div class="modal-overlay" id="modal-overlay"></div>

<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" id="modal">
  <button class="close-btn" type="button" aria-label="Close">✕</button>
  <h2 id="modal-title">Details</h2>
  <dl id="modal-content"></dl>
  <button type="button" id="modal-close">Close</button>
</div>
```

Notice:

- `role="dialog"` and `aria-modal="true"`: announced as a dialog, and tells
  assistive tech that the rest of the page is out of play;
- `aria-labelledby` on its heading: the dialog is **named** by it, and the
  name is read when the focus enters;
- `aria-label="Close"` on the ✕: a glyph is not a name. Without it, the button
  is announced as *"multiplication x"*, or nothing;
- a `<dl>`: the details are term/value pairs.

Add `.modal dl` / `dt` styles if you want the pairs laid out in two columns.

### 2. A button per row

1. In the table, add a fourth column header: `<th scope="col">Actions</th>`.
2. In `renderPeople()`, add a fourth cell with a button:

   ```html
   <td>
     <button type="button" class="btn-details" data-id="2">
       View details<span class="sr-only"> of Marie Martin</span>
     </button>
   </td>
   ```

   Five buttons all named *"View details"* are useless in a screen reader's list
   of buttons. The `.sr-only` span completes the name for assistive tech
   (*"View details of Marie Martin"*), without cluttering the table for the eyes.
   The visible text stays at the **start** of the name: a voice control user
   saying *"click View details"* still hits it.

### 3. Opening it

In `script.js`, write the function wired in `DOMContentLoaded` (the TODO). It
does nothing when `#modal` is not on the page. Listen to clicks on `#people`
(one listener for every row: `event.target.closest('.btn-details')`), find the
person from `data-id`, and open the dialog with it:

1. **remember the trigger**, the button that was clicked: the focus goes back
   there on close;
2. set the **title** to the person's name (`Marie Martin`): it is the name of
   the dialog;
3. fill the `<dl>` with `<dt>`/`<dd>` pairs: last name, first name, birth date;
4. make the page behind **inert**: `element.inert = true` on the `header`,
   `main`, `footer` and the skip link. `inert` removes them from the Tab order
   **and** from the accessibility tree, and blocks clicks — `aria-modal` alone is
   not honoured by every screen reader;
5. add `is-open` to the overlay and the dialog;
6. move the **focus into** the dialog: on the *Close* button at the bottom (or
   the first focusable element).

### 4. The focus trap

`inert` already keeps Tab out of the page, but the focus can still leave to the
browser's address bar. Trap it: on **Tab** in the dialog,

```javascript
function trapFocus(modal, event) {
  const focusable = [...modal.querySelectorAll(FOCUSABLE)];
  const first = focusable[0];
  const last = focusable.at(-1);

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
```

with `FOCUSABLE` a selector of what can take the focus:
`'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'`.
The list is read **on each key press**: the content of a dialog can change.

### 5. Closing it

1. **Escape** (a `keydown` on the dialog), the **✕**, the **Close** button, and
   a **click on the overlay** all close it.
2. On close: remove `is-open` from both, set `inert = false` on everything you
   made inert, and **put the focus back on the trigger**. Without that last step,
   the focus falls to `<body>` and a keyboard user starts again from the top of
   the page.
3. Closing an already closed dialog does nothing.

## Checking your work

**By hand.** Tab to *View details* of a row, press Enter: the dialog opens, the
screen reader announces *"Marie Martin, dialog"*. Tab and Shift+Tab cycle
between the ✕ and *Close*, and never reach the page. With the screen reader's
virtual cursor, try to read the table behind: it is gone. Escape: the dialog
closes and the focus is back on the button you used.

**From the terminal**, in the training folder:

```bash
pnpm run verify --dir workshops --tp 07
```

It replays the checks of workshops 3 to 6, then, on `index.html`, checks that:

- each of the 5 rows has a button named *View details …* with the person's name
  (*View details of Marie Martin* is one);
- no dialog is shown at start.

It focuses Marie Martin's button, presses Enter, and checks that:

- a dialog opens, with `aria-modal="true"`;
- its name (from `aria-labelledby`) contains *Marie Martin*;
- it shows her details (*Martin*, *1975-03-22*);
- the focus moved into the dialog;
- both close buttons, the ✕ included, are named *Close*;
- 5 Tab, then 5 Shift+Tab, keep the focus inside;
- the `header` and `main` of the page are inert.

Then: Escape closes it, the focus is back on the button that opened it, and
nothing is inert anymore; the *Close* button closes it; a click on the overlay
closes it; no JavaScript error in the page.

## Going further

- Rebuild it with the native **`<dialog>`** element and `showModal()`: the
  focus, the inert page, Escape and the top layer come for free. What is still
  yours? (Hint: giving the focus back, the overlay click, the name.)
- Respect `prefers-reduced-motion` if you add an opening animation.
- Prevent the page behind from scrolling while the dialog is open.
- Put a long content in the dialog, and a form: does the trap still work with an
  `<input type="date">`, which has several Tab stops?

## Useful links

- [APG — Dialog (Modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [MDN — The `<dialog>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [MDN — `inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert)
- [A11ycasts — Dialog](https://www.youtube.com/watch?v=JS68faEUduk)
