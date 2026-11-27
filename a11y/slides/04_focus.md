---
layout: cover
---

# 04 - Focus and keyboard

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Navigate** a page with the keyboard only, the way your users do
- **Tell** which elements are focusable, and keep the tab order logical
- **Use** `tabindex` correctly: `0` and `-1`, never a positive value
- **Add** a skip link and a visible focus indicator (WCAG 2.4.1, 2.4.7)
- **Trap** the focus in a component that must keep it — and give it back

<!--
Five objectives, one per block of slides: keyboard, focusable elements and
tab order, tabindex and JavaScript, skip link and focus indicator, focus trap.
Each WCAG criterion comes with its RGAA 4.1.2 equivalent, for the French audits.
The workshop at the end covers the skip link and the focus indicator.
-->

---

# The keyboard, as your users use it

| Keys | What it does |
|---|---|
| **Tab** / **Shift + Tab** | next / previous focusable element |
| **Enter** | follow a link, press a button, submit a form |
| **Space** | press a button, tick a checkbox, scroll the page |
| **Arrows** | move **inside** a control: radios, select, tabs, menu |
| **Escape** | close a dialog, a menu, a tooltip |

<br />

- Keyboard only: motor impairments, screen reader users, power users
- **Golden rule**: if you can click it, you can reach it and use it with the
  keyboard — **WCAG 2.1.1** Keyboard (A), RGAA 7.3
- Safari / macOS: Tab skips links by default — **Option + Tab**, or turn on
  "Press Tab to highlight each item" in the settings

<!--
Demo: put the mouse away and go through the training site with Tab only.
Ask the room who has already used Shift+Tab, or Space to scroll a page.
Safari setting: Settings > Advanced > "Press Tab to highlight each item on a
webpage". macOS also has a system-wide "Keyboard navigation" toggle.
-->

---

# What is focusable — by default

<div style="display: flex; gap: 2em;">
<div>

### Focusable, for free

- `<a href>` — **with** an `href`
- `<button>`
- `<input>`, `<select>`, `<textarea>`
- `<summary>` (of a `<details>`), `<iframe>`
- any element with `contenteditable`

</div>
<div>

### Not focusable

- `<div>`, `<span>`, `<p>`, `<li>`, `<img>`…
- `<a>` **without** `href`
- anything `disabled`, `hidden`, `display: none`,
  `visibility: hidden` or inside an `inert` subtree

</div>
</div>

<br />

- **Only interactive elements** take the focus: tabbing through every paragraph
  is not "more accessible", it is tedious
- Exceptions in a **SPA**: move the focus to the new page's heading, to an error
  summary, into a dialog — with `tabindex="-1"` (below)

<!--
`disabled` only exists on form controls and buttons; on a link, there is no
disabled state: remove the href instead.
`inert` (supported everywhere since 2023) comes back in chapter 08.
-->

---

# The tab order follows the DOM, not the screen

```html
<section class="toolbar">
  <a href="#">1</a> <a href="#">2</a> <a href="#">3</a> <a href="#">4</a>
</section>
```

```css
/* ❌ Seen: 4 3 2 1 — Tab goes 1 2 3 4: the focus jumps backwards */
.toolbar { display: flex; flex-direction: row-reverse; }
```

- `row-reverse`, `order`, `grid-area`, `position: absolute`: the **visual** order
  changes, the **focus** order does not
- **WCAG 2.4.3** Focus Order (A), RGAA 12.8: the order must preserve meaning
- Fix it in the **HTML**: write the elements in the order you show them

<!--
Demo: open the example, press Tab, watch the focus go right to left.
The same goes for the screen reader: it reads the DOM order too (WCAG 1.3.2
Meaningful Sequence). Fixing the HTML fixes both.
-->

---

# `tabindex` — two values, and one to forget

```html
<div tabindex="0">Reached by Tab, in the DOM order</div>
<div tabindex="-1">Not reached by Tab — but element.focus() works</div>
<div tabindex="3">❌ Reached BEFORE every other element of the page</div>
```

| Value | Tab reaches it? | `.focus()` works? | Use it for |
|---|---|---|---|
| none (native) | ✅ | ✅ | buttons, links, fields — the default |
| `0` | ✅ in DOM order | ✅ | a custom widget (with its `role`, chapter 07) |
| `-1` | ❌ | ✅ | a target you move the focus to: `<main>`, a heading, a dialog |
| `> 0` | ✅ **first**, by value | ✅ | **never** — the order becomes unpredictable |

<style>
table { font-size: 0.85em; }
</style>

<!--
A positive tabindex jumps the queue: every element with tabindex >= 1 comes
before all the others, sorted by value, then the rest in DOM order. On a page
built from several components, nobody can keep that order straight.
tabindex="0" alone is not enough for a custom widget: it also needs a role and
Enter/Space handling — chapter 07.
-->

---

# The focus, from JavaScript

```js
document.activeElement;                  // the element that has the focus now

const main = document.querySelector('#main');
main.focus();                            // needs tabindex="-1" on a non-focusable element

main.addEventListener('focus', () => { /* got it */ });
main.addEventListener('blur', () => { /* lost it */ });
// focusin / focusout: the same, but they bubble — listen on a container
```

- DevTools tip: **Console → Live expression** `document.activeElement` — see the
  focus move as you press Tab
- Moving the focus is a **strong** signal: the screen reader reads the new
  element. Do it on purpose, never on page load "to help"

<!--
Show the live expression in Chrome DevTools: the eye icon in the Console.
focus/blur do not bubble, focusin/focusout do: that is why a dialog or a menu
listens to focusout on its container to know when the focus leaves it.
-->

---

# Skip link — jump over the header

The first Tab of every page reaches it. Without it, a keyboard user goes
through the whole menu on **every** page (**WCAG 2.4.1** Bypass Blocks, A —
RGAA 12.7).

```html
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header> … 15 links … </header>
  <main id="main" tabindex="-1"> … </main>
</body>
```

```css
.skip-link { position: absolute; top: -40px; left: 0; padding: 8px;
             background: #000; color: #fff; z-index: 100; }
.skip-link:focus { top: 0; }    /* off screen, until it gets the focus */
```

- Not `display: none`: an element that is not displayed cannot take the focus
- `tabindex="-1"` on `<main>`: without it, some browsers scroll to it but
  leave the focus behind — the next Tab starts from the top again
- See it live: Tab on [github.com](https://github.com/) or [axesslab.com](https://axesslab.com/)

<!--
Demo: on github.com, the first Tab shows "Skip to content" at the top left.
This is exactly what workshop 03 builds. 2.4.1 can also be met with landmarks
and headings, but the RGAA 12.7 asks for a skip link (or a quick access link)
on every page.
-->

---

# A visible focus indicator

```css
/* ❌ The focus is gone — for everybody, for good */
*:focus { outline: none; }

/* ✅ Ours, contrasted, shown for keyboard users */
a:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;   /* 6.7:1 on white */
  outline-offset: 2px;
}
header a:focus-visible { outline-color: #ffbf47; }  /* 3.1:1 on the blue header */
```

- **WCAG 2.4.7** Focus Visible (AA), RGAA 10.7 — and **1.4.11** Non-text
  Contrast (AA): the indicator needs **3:1** against what surrounds it
- `:focus-visible` — the browser shows it for the keyboard, not on a mouse click
- On a dark header, a blue outline disappears: test on **every** background
- Replacing the outline (a border, a `box-shadow`) is fine — removing it is not
- New in WCAG 2.2: **2.4.11** Focus Not Obscured (AA) — not hidden behind a
  sticky header or a cookie banner

<!--
No single colour works everywhere: the yellow #ffbf47 is only 1.6:1 on white,
the blue is invisible on the blue header. Hence one colour per background, or
a double ring (white + dark) that shows on both.
box-shadow disappears in Windows High Contrast mode (forced colours): keep an
outline, even transparent, as a fallback.
2.4.13 Focus Appearance (AAA) gives the exact size; 2.4.11 is not in RGAA 4.1.2
yet (WCAG 2.1 based), RGAA 5 will bring it.
-->

---

# Focus trap — keep the focus in a dialog

While a modal dialog is open, Tab must not escape to the page behind it.

```js
modal.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const focusables = modal.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), '
    + 'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
```

- Three steps: **move** the focus in, **trap** it, **give it back** to the
  opener on close
- Not a keyboard trap (**WCAG 2.1.2**, RGAA 12.9): Escape and the close button
  let the user out
- Today: `<dialog>` + `showModal()` and the `inert` attribute do most of it —
  chapter 08 and workshop 07

<!--
Only show the code, do not type it: chapter 08 builds the custom dialog step by
step. The point here is the three steps, and the difference between a focus
trap you want (a modal, with a way out) and a keyboard trap you do not (an
embedded player that swallows Tab, with no way out).
-->

---

# Checklist — focus and keyboard

| ✅ Do | ❌ Avoid |
|---|---|
| Native elements: `<button>`, `<a href>` | A clickable `<div>` with no `tabindex` |
| DOM order = visual order | `flex-direction: row-reverse` on links |
| `tabindex="0"` / `"-1"` | `tabindex="1"` and above |
| A skip link, first in the `<body>` | Fifteen Tabs to reach the content |
| `:focus-visible` with 3:1 contrast | `outline: none` with nothing instead |
| Move the focus on purpose (dialog, new page) | Steal it on page load |

<br />

> **Test it**: put the mouse away, and go through the page with Tab,
> Shift+Tab, Enter, Space and Escape. Every action must be possible, and you
> must always see where you are.

<style>
table { font-size: 0.85em; }
</style>

<!--
Recap of the chapter, and the manual test the participants will run on their
own pages. Transition: workshop 03 applies two lines of this table — the skip
link and the visible focus — on the Genea11y pages, graded with
`pnpm run verify --dir workshops --tp 03`. The focus trap waits for chapter 08
and workshop 07.
-->

---

# Quiz — Focus and keyboard

**`tabindex="-1"`: reached by Tab? Focusable by `.focus()`?**

- A) Reached by Tab, not focusable by `.focus()`
- B) Neither
- C) Not reached by Tab, focusable by `.focus()`
- D) Both, but last in the Tab order

<v-click>

**Answer: C** — Not by Tab, yes by `.focus()` — for a heading, `<main>`, a dialog.

</v-click>

---

# Quiz — Focus and keyboard

**Why never `tabindex="3"`?**

- A) It is invalid HTML
- B) It jumps ahead of the whole page: the order becomes unpredictable
- C) It only works on links
- D) Screen readers ignore it

<v-click>

**Answer: B** — Every positive value jumps ahead of the whole page: the order becomes unpredictable.

</v-click>

---

# Quiz — Focus and keyboard

**`outline: none` on `:focus` — what must you add?**

- A) Nothing: the browser handles it
- B) `tabindex="0"`
- C) `aria-hidden="true"`
- D) A visible `:focus-visible` style, 3:1 contrast

<v-click>

**Answer: D** — A visible `:focus-visible` style, 3:1 contrast — WCAG 2.4.7.

</v-click>

---
layout: cover
---

# Workshop 03

## Focus and skip link

<!--
Transition: workshop 03 adds the skip link and a visible focus style to both pages. `pnpm run verify --tp 03` checks them; then Tab through the page by hand. Next chapter: semantic HTML — the landmarks, the navigation and the table of the same app.
-->
