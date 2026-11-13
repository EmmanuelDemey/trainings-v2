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
  keyboard
- Safari / macOS: Tab skips links by default — **Option + Tab**, or turn on
  "Press Tab to highlight each item" in the settings

---

# What is focusable — by default

<div style="display: flex; gap: 2em;">
<div>

### Focusable, for free

- `<a href>` — **with** an `href`
- `<button>`
- `<input>`, `<select>`, `<textarea>`
- `<summary>` (of a `<details>`)
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
- **WCAG 2.4.3** Focus Order (A): the order must preserve meaning
- Fix it in the **HTML**: write the elements in the order you show them

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

---

# Skip link — jump over the header

The first Tab of every page reaches it. Without it, a keyboard user goes
through the whole menu on **every** page (**WCAG 2.4.1** Bypass Blocks, A).

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
- `tabindex="-1"` on `<main>`: some browsers scroll to it but leave the focus behind
- See it live: Tab on [github.com](https://github.com/) or [axesslab.com](https://axesslab.com/)

---

# A visible focus indicator

```css
/* ❌ The focus is gone — for everybody, for good */
*:focus { outline: none; }

/* ✅ Ours, contrasted, shown for keyboard users */
a:focus-visible,
button:focus-visible {
  outline: 3px solid #ffbf47;
  outline-offset: 2px;
}
```

- **WCAG 2.4.7** Focus Visible (AA) — and **1.4.11** Non-text Contrast (AA):
  the indicator needs **3:1** against what surrounds it
- `:focus-visible` — the browser shows it for the keyboard, not on a mouse click
- On a dark header, a blue outline disappears: test on **every** background
- Replacing the outline (`box-shadow`, a border) is fine — removing it is not

---

# Focus trap — keep the focus in a dialog

While a modal dialog is open, Tab must not escape to the page behind it.

```js
modal.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const focusables = modal.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
```

- Three steps: **move** the focus in, **trap** it, **give it back** to the
  opener on close
- Today: `<dialog>` + `showModal()` and the `inert` attribute do most of it —
  chapter 08 and workshop 07

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

---
layout: cover
---

# Workshop 03

## Focus and skip link

`workshops/03_focus`
