---
layout: cover
---

# 08 - Complex components

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Build** a modal dialog that moves the focus in, keeps it inside, closes
  on Escape and gives it back — and **prefer** the native `<dialog>`
- **Use** `inert` to take the rest of the page out of reach
- **Implement** tabs and tooltips that work with the keyboard, following the
  ARIA Authoring Practices Guide
- **Announce** dynamic messages with live regions: `status`, `alert`,
  `aria-live`
- **Provide** captions and transcripts for video and audio

---

# Complex components — the method

| Component | Native first | ARIA pattern (APG) |
|---|---|---|
| **Modal dialog** | `<dialog>` + `showModal()` | `role="dialog"` + `aria-modal` |
| **Popover, menu** | `popover` attribute | `role="menu"`, `aria-haspopup` |
| **Disclosure, accordion** | `<details>` + `<summary>` | `aria-expanded` + `aria-controls` |
| **Tabs** | — | `tablist` / `tab` / `tabpanel` |
| **Tree** | — | `tree` / `treeitem` / `group` |
| **Tooltip** | — | `role="tooltip"` + `aria-describedby` |
| **Notification** | `<output>` | `role="status"`, `role="alert"` |

<br />

> For each one, the APG page gives a **keyboard table**: implement every row,
> then test with a screen reader.

<style>
table { font-size: 0.85em; }
</style>

---

# A modal dialog — the contract

<div style="display: flex; gap: 2em;">
<div>

### What it says

- It is a **dialog**, and it is **modal**
- It has a **name**: its title
- Every button in it has a **name** — *"Close"*, not *"✕"*
- WCAG **4.1.2** Name, Role, Value (A)

</div>
<div>

### What it does

- **On open**: the focus moves **into** the dialog
- **While open**: Tab stays **inside**; the page behind is out of reach
- **Escape** closes it
- **On close**: the focus goes **back** to the button that opened it
- WCAG **2.1.2** No Keyboard Trap (A), **2.4.3** Focus Order (A)

</div>
</div>

<br />

> Forget the last step and a keyboard user is sent back to the top of the
> page — every time they close the dialog.

---

# The recommended way — native `<dialog>`

```html
<button type="button" id="open-details">Details of Ada Lovelace</button>

<dialog id="details" aria-labelledby="details-title">
  <h2 id="details-title">Ada Lovelace</h2>
  <p>Born in 1815, in London.</p>
  <form method="dialog">
    <button>Close</button>          <!-- closes the dialog, no JS needed -->
  </form>
</dialog>
```

```js
const dialog = document.getElementById('details');
document.getElementById('open-details')
  .addEventListener('click', () => dialog.showModal());
```

- `showModal()` gives you, **for free**: the `dialog` role, modality, the
  rest of the page made **inert**, the focus moved in, **Escape** to close,
  and the focus **restored** on close
- `::backdrop` styles the overlay; baseline in every browser since 2022
- `show()` (not `showModal()`) opens a **non-modal** dialog: none of the above

---

# `inert` — the rest of the page, out of reach

```html
<header inert>…</header>
<main inert>…</main>     <!-- not clickable, not focusable, not in the a11y tree -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">…</div>
```

```js
for (const region of [header, main, footer]) region.inert = true;   // on open
for (const region of [header, main, footer]) region.inert = false;  // on close
```

- One attribute does what took a script before: removes the subtree from the
  **Tab order**, from **clicks**, and from the **accessibility tree**
- `aria-modal="true"` alone only **asks** the screen reader to ignore the page:
  it changes nothing for the keyboard
- `showModal()` makes the page inert **itself** — you need `inert` by hand
  only for a custom `role="dialog"`
- Baseline in every browser since 2023

---

# Custom dialog — the markup

When you cannot use `<dialog>` (an old design system, a library) — and in
**workshop 07**, to see every piece:

```html
<button type="button" class="open-details" data-id="1">Details of Ada Lovelace</button>

<div class="overlay"></div>
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" id="modal">
  <button type="button" class="close-btn" aria-label="Close">✕</button>
  <h2 id="modal-title">Ada Lovelace</h2>
  <p>Born in 1815, in London.</p>
  <button type="button" class="close">Close</button>
</div>
```

- `role="dialog"` + `aria-modal="true"`: announced as a modal dialog
- `aria-labelledby` on the heading: the dialog is **named** by its title —
  `aria-label="…"` when there is no visible title
- `aria-label="Close"` on the ✕: a glyph is not a name

---

# Custom dialog — step 1, open

```js
const FOCUSABLE = [
  'a[href]', 'area[href]', 'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])',
  'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(', ');

let trigger;                                     // who opened the dialog

function openModal(event) {
  trigger = event.currentTarget;                 // remembered for step 4
  for (const region of pageRegions) region.inert = true;
  overlay.classList.add('is-open');
  modal.classList.add('is-open');
  modal.querySelector(FOCUSABLE).focus();        // the focus moves IN
}
```

- `:not([disabled])` — the old `input:not[disabled]` is **invalid CSS**:
  `querySelectorAll` throws a `SyntaxError`
- Move the focus to the **first** control, or to the least destructive one
  (*Cancel*, *Close*) — the APG leaves the choice to you

---

# Custom dialog — step 2, trap Tab

```js
modal.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;

  // Read the list on EACH key press: the content of a dialog can change
  const focusable = [...modal.querySelectorAll(FOCUSABLE)];
  const first = focusable[0];
  const last = focusable.at(-1);

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();                     // Shift+Tab on the first: wrap to the last
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();                    // Tab on the last: wrap to the first
  }
});
```

- `inert` already keeps the focus out of the **page** — the trap keeps it
  from leaving to the browser's **address bar**
- `event.key === 'Tab'`, never the deprecated `event.keyCode === 9`

---

# Custom dialog — step 3, Escape · step 4, close

```js
modal.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});
closeButtons.forEach((button) => button.addEventListener('click', closeModal));
overlay.addEventListener('click', closeModal);

function closeModal() {
  modal.classList.remove('is-open');
  overlay.classList.remove('is-open');
  for (const region of pageRegions) region.inert = false;
  trigger.focus();                         // the focus goes BACK where it was
}
```

- **Every** way out does the same thing: Escape, the ✕, *Close*, a click on
  the overlay
- `inert = false` **before** `trigger.focus()`: an inert element cannot take
  the focus
- Count it: four steps, about forty lines — `showModal()` does all of it

---

# Tabs — the markup

```html
<div role="tablist" aria-label="Family">
  <button role="tab" id="tab-parents" aria-selected="true" aria-controls="panel-parents">
    Parents
  </button>
  <button role="tab" id="tab-children" aria-selected="false" aria-controls="panel-children"
          tabindex="-1">
    Children
  </button>
</div>

<div role="tabpanel" id="panel-parents" aria-labelledby="tab-parents" tabindex="0">…</div>
<div role="tabpanel" id="panel-children" aria-labelledby="tab-children" hidden>…</div>
```

- `tablist` > `tab` > `tabpanel`, tied both ways: `aria-controls` /
  `aria-labelledby`
- `aria-selected` on the current tab — a **state**, updated on every change
- Roving tabindex: **one** Tab stop for the tab list, then Tab goes to the
  panel

---

# Tabs — the keyboard

| Key | Does |
|---|---|
| **Tab** | Enters the tab list on the **selected** tab, then moves to the panel |
| **← / →** | Previous / next tab, wrapping around |
| **Home / End** | First / last tab |
| **Enter / Space** | Activates the focused tab — only with *manual* activation |

<br />

- **Automatic** activation: the arrows also **show** the panel — the default,
  when panels are instant
- **Manual** activation: the arrows only move the focus — when a panel is slow
  to load
- Not a navigation: tabs switch content **in place**. Links to other pages are
  a `<nav>` with `aria-current="page"`

<style>
table { font-size: 0.9em; }
</style>

---

# Tooltips — not only on hover

```html
<label for="birth">Birth date</label>
<input id="birth" type="date" aria-describedby="birth-tip" />
<button type="button" aria-label="Help about the birth date" aria-expanded="false">?</button>
<div role="tooltip" id="birth-tip" hidden>Leave it empty if unknown.</div>
```

<div style="display: flex; gap: 2em;">
<div>

### ❌ Hover only

- `mouseover` / `mouseout`: keyboard, touch and switch users **never** see it

</div>
<div>

### ✅ WCAG 1.4.13 Content on Hover or Focus (AA)

- Shown on **hover and focus**
- **Dismissable** with Escape, without moving the pointer
- **Hoverable**: the pointer can move onto it
- **Persistent**: stays until the user leaves

</div>
</div>

<br />

> Information the user **needs** does not belong in a tooltip: put it on the
> page, as a hint.

---

# Tree views

```html
<ul role="tree" aria-label="Family tree">
  <li role="treeitem" aria-expanded="true">
    Ada Lovelace
    <ul role="group">
      <li role="treeitem">Byron King</li>
      <li role="treeitem">Anne King</li>
    </ul>
  </li>
  <li role="treeitem" aria-expanded="false">Charles Babbage …</li>
</ul>
```

- No HTML element: `tree` > `treeitem`, children in a `group`
- `aria-expanded` on items **with** children only — a leaf has none
- Keyboard (APG): ↑ ↓ move, → opens / goes to the first child, ← closes / goes
  to the parent, Home / End, roving tabindex
- Heavy to build: check whether a list of headings and `<details>` would do

---

# Live regions — announce what changes

```html
<!-- In the page FROM THE START, empty -->
<div role="status"></div>
```

```js
status.textContent = 'Ada Lovelace was added to the family tree.';
```

| | `role="status"` | `role="alert"` |
|---|---|---|
| Implies | `aria-live="polite"` | `aria-live="assertive"` |
| Read | when the screen reader is idle | **at once**, interrupting |
| For | *Saved*, *3 results*, *Copied* | errors, session about to expire |

- The region must exist **before** its content changes: one inserted with its
  text already in it is often **not** read
- WCAG **4.1.3** Status Messages (AA) — use `alert` sparingly: it interrupts
- Don't remove the message too quickly: the user needs time to hear it, or
  read it — WCAG **2.2.1** Timing Adjustable (A)

<style>
table { font-size: 0.85em; }
</style>

---

# Video and audio — captions and transcripts

```html
<video controls poster="ada-poster.jpg">
  <source src="ada.webm" type="video/webm" />
  <source src="ada.mp4" type="video/mp4" />
  <track kind="captions" src="ada.en.vtt" srclang="en" label="English" default />
</video>
```

| Media | Needs | WCAG |
|---|---|---|
| Video with sound | **Captions** — `kind="captions"`: dialogue **and** sounds | 1.2.2 (A) |
| Video | **Audio description** of what is only seen | 1.2.5 (AA) |
| Audio only | A **transcript** | 1.2.1 (A) |
| Live | Live captions | 1.2.4 (AA) |

- `kind="subtitles"` is a **translation**; `kind="captions"` is for deaf and
  hard-of-hearing users
- Never autoplay with sound — WCAG **1.4.2** Audio Control (A)

<style>
table { font-size: 0.85em; }
</style>

---

# Caption formats

<div style="display: flex; gap: 2em;">
<div style="flex: 1; min-width: 0;">

### WebVTT — the one browsers read

```text
WEBVTT

1
00:00:09.000 --> 00:00:11.000
<v Alice>Curiouser and curiouser.

2
00:00:17.000 --> 00:00:18.000
<v Rabbit>I told you she was the right Alice!

3
00:00:19.000 --> 00:00:20.000
[a door slams]
```

</div>
<div style="flex: 1; min-width: 0;">

### TTML and SRT

```xml
<tt xmlns="http://www.w3.org/ns/ttml" xml:lang="en">
  <body><div>
    <p begin="00:00:09.000" end="00:00:11.000">
      Alice: Curiouser and curiouser.
    </p>
  </div></body>
</tt>
```

- **TTML**: XML, broadcast and streaming tools
- **SRT**: the simplest, very common — convert it to VTT for `<track>`
- Mark sounds, not only speech: *[a door slams]*

</div>
</div>

---

# Recap — complex components

| Component | Must have |
|---|---|
| **Dialog** | Name · focus in · Tab trapped · Escape · focus back — or just `showModal()` |
| **Tabs** | `tablist`/`tab`/`tabpanel` · `aria-selected` · arrows · one Tab stop |
| **Tooltip** | Hover **and** focus · Escape · hoverable · persistent |
| **Tree** | `tree`/`treeitem`/`group` · `aria-expanded` · arrows |
| **Live region** | In the page from the start · `status` by default, `alert` for urgent |
| **Media** | Captions · transcript · audio description · no autoplay with sound |

<style>
table { font-size: 0.85em; }
</style>

---
layout: cover
---

# Workshop 07

## A modal dialog

`workshops/07_modal`
