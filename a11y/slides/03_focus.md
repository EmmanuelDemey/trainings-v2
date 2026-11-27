---
layout: cover
---

# 03 - Focus, keyboard and visual design

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Navigate** a page with the keyboard only, the way your users do
- **Tell** which elements are focusable, and keep the tab order logical
- **Use** `tabindex` correctly: `0` and `-1`, never a positive value
- **Add** a skip link and a visible focus indicator (WCAG 2.4.1, 2.4.7)
- **Trap** the focus in a component that must keep it — and give it back
- **Keep** the page usable at 200 % text and 400 % zoom, and honour the user's
  preferences: theme, reduced motion, orientation
- **Measure** a contrast ratio, and know the 4.5:1 and 3:1 thresholds

<!--
Seven objectives, one per block of slides: keyboard, focusable elements and
tab order, tabindex and JavaScript, skip link and focus indicator, focus trap,
then the visual block: zoom and preferences, contrast.
Each WCAG criterion comes with its RGAA 4.1.2 equivalent, for the French audits.
The workshop at the end covers the skip link, the focus indicator, and a
reflow check at 320 px.
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
`inert` (supported everywhere since 2023) comes back in chapter 07.
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
| `0` | ✅ in DOM order | ✅ | a custom widget (with its `role`, chapter 06) |
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
Enter/Space handling — chapter 06.
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
  chapter 07 and workshop 07

<!--
Only show the code, do not type it: chapter 07 builds the custom dialog step by
step. The point here is the three steps, and the difference between a focus
trap you want (a modal, with a way out) and a keyboard trap you do not (an
embedded player that swallows Tab, with no way out).
-->

---

# Seeing the page — not only reaching it

Keyboard users need to **see** the focus. Low vision users need to **see**
everything else: they zoom, enlarge the text, change the colours.

- **Size and zoom** — relative units, 200 % text, reflow at 320 px
- **User preferences** — dark theme, reduced motion, forced colours, orientation
- **Contrast** — text 4.5:1, focus indicator and controls 3:1

<!--
Bridge from the focus indicator to the rest of the visual criteria. All of
these are tested with the eyes and the DevTools, not the screen reader.
Workshop 03 ends with a check of the page at 400 % and with the preferences
emulated.
-->

---

# Sizes — relative units

```css
html { font-size: 100%; }         /* ✅ the user's setting: 16px by default */
body { font-size: 1rem; }         /* ✅ text follows the user's choice */
.card { max-width: 40rem; width: 100%; }
h1 { font-size: 2.5rem; }

p { font-size: 14px; }            /* ⚠️ ignores the user's default size */
```

- **`rem` / `em`** for text: it follows the browser's font size setting
- **WCAG 1.4.4** Resize Text (AA): readable at **200 %**; **1.4.10** Reflow (AA):
  no horizontal scroll at **320 px** wide
- `%`, `vw` / `vh`, `max-width` for layout; avoid fixed heights on text boxes

<!--
RGAA 10.4 (text resized to 200 %) and 10.11 (reflow at 320 px). Demo:
browser settings, font size "Very large", then a page in px versus rem.
Zoom works either way: the font size setting is the one px breaks.
-->

---

# Zoom and reflow — 200 %, 400 %, 320 px

<div style="display: flex; gap: 2em;">
<div>

### The criteria

- **1.4.4** Resize Text (AA) — text resized to **200 %**, nothing lost
- **1.4.10** Reflow (AA) — at **320 CSS px** wide, a **single column**: no
  horizontal scroll for vertical text
- 320 px = a **1280 px** screen zoomed to **400 %** — the same test
- **1.4.12** Text Spacing (AA) — larger line, letter and word spacing do
  not cut the text

</div>
<div>

### How to test

1. Browser zoom **200 %**, then **400 %** (Ctrl / Cmd and +)
2. Or DevTools → device toolbar, **320 px** wide
3. Look for: horizontal scrollbar, text **cut** or **overlapping**, a sticky
   header that covers the screen, content that disappears
4. Exceptions: data tables, maps, diagrams, toolbars may scroll in two
   directions

</div>
</div>

<!--
Who needs it: low vision users zoom to 400 % and more, often with a screen magnifier (chapter 01). RGAA 10.4 (text at 200 %) and 10.11 (reflow at 320 px) — 10.12 for text spacing. A responsive site usually passes reflow for free; what fails is fixed widths, fixed heights on text, and sticky headers that take half the screen once zoomed (also 2.4.11 Focus Not Obscured).
-->

---

# Reflow — what breaks, and the fix

```css
/* ❌ A fixed width: a horizontal scrollbar at 320 px */
.layout { width: 1200px; }
/* ✅ */
.layout { max-width: 75rem; width: 100%; }

/* ❌ A fixed height: the text overflows when it is zoomed or spaced */
.card { height: 180px; overflow: hidden; }
/* ✅ */
.card { min-height: 11rem; }

/* ✅ Columns that wrap instead of shrinking */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr)); }

/* ✅ A sticky header only when there is room for it */
@media (min-height: 30rem) { header { position: sticky; top: 0; } }

/* ✅ Long words and URLs */
p { overflow-wrap: anywhere; }
```

```html
<!-- ❌ Blocks pinch-zoom on mobile -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<!-- ✅ -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

<!--
Zooming the page makes the CSS viewport narrower, so the media queries apply: the same mobile layout serves 400 % zoom on desktop. The sticky header trick: at 400 % on a laptop the viewport is about 180 px high, a 100 px header leaves almost nothing. Test the text spacing with the bookmarklet of Steve Faulkner (link in RESSOURCES.md).
-->

---

# User preferences — media queries

| Media query | The user asked for… | You… |
|---|---|---|
| `prefers-color-scheme: dark` | a dark theme (photophobia, migraines) | switch your colour tokens |
| `prefers-reduced-motion: reduce` | less motion (vestibular disorders) | drop or shorten animations |
| `prefers-contrast: more` | more contrast | strengthen borders, colours |
| `forced-colors: active` | a forced palette (Windows contrast themes) | use system colours, keep borders |

```css
:root { --text: #1a1a1a; --background: #fff; }
@media (prefers-color-scheme: dark) {
  :root { --text: #f0f0f0; --background: #121212; }
}
```

- DevTools → **Rendering** panel: emulate each preference without changing your OS

<!--
DevTools, Rendering panel: "Emulate CSS media feature" for
prefers-color-scheme, prefers-reduced-motion, prefers-contrast and
forced-colors. In forced colours, box-shadow and background images
disappear: a focus ring drawn with box-shadow vanishes.
-->

<style>
table { font-size: 0.8em; }
</style>

---

# Reduced motion

```css
/* Animations only for users who did not ask for less motion */
@media (prefers-reduced-motion: no-preference) {
  .card { transition: transform 300ms; }
  .card:hover { transform: scale(1.05); }
}

/* Or: a safety net for everything */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- Motion can trigger **dizziness, nausea**; flashes can trigger **seizures**
- **WCAG 2.3.1** Three Flashes (A) · **2.2.2** Pause, Stop, Hide (A) ·
  **2.3.3** Animation from Interactions (AAA)

<!--
2.3.1 is about flashes (more than 3 per second), not motion; 2.2.2 is about
content that moves on its own for more than 5 s; 2.3.3 covers motion
triggered by an interaction. RGAA 13.7 (flashes) and 13.8 (moving content).
-->

---

# The same preferences, in JavaScript — `matchMedia`

```js
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotion.matches) startCarousel();

// React when the user changes the setting while the page is open
reducedMotion.addEventListener('change', (event) => {
  if (event.matches) stopCarousel();
});
```

- Any media query: `(prefers-color-scheme: dark)`, `(forced-colors: active)`,
  `(orientation: portrait)`
- `addListener` is deprecated: use `addEventListener('change', …)`
- For what CSS cannot do: a carousel, a video autoplay, a canvas animation

<!--
MediaQueryList.addListener still works but is marked deprecated in the
spec; addEventListener('change') is supported everywhere today.
-->

---

# Orientation — adapt, never lock

```css
/* ✅ Adapt the layout to the orientation */
.tree { display: flex; flex-direction: row; }
@media (orientation: portrait) {
  .tree { flex-direction: column; }
}
```

```js
// ❌ Locks the screen: a user whose tablet is mounted on a wheelchair is stuck
screen.orientation.lock('landscape');
```

- **WCAG 1.3.4** Orientation (AA): the content works in **both** orientations
- Never ask "please rotate your device" unless the orientation is essential
  (a piano app, a bank cheque scan)

<!--
RGAA 13.9 (content viewable in both orientations). screen.orientation.lock
only works in fullscreen on most mobile browsers — but the warning stays:
do not force it.
-->

---

# Contrast ratio

| Content | AA | AAA |
|---|---|---|
| Body text | **4.5:1** — WCAG 1.4.3 | **7:1** — WCAG 1.4.6 |
| Large text (24 px, or 18.66 px bold) | **3:1** — WCAG 1.4.3 | **4.5:1** — WCAG 1.4.6 |
| UI components, focus indicator, icons | **3:1** — WCAG 1.4.11 | — |

<br />

- Ratio = `(L1 + 0.05) / (L2 + 0.05)`, L1 the **lighter** colour's relative
  luminance (0 = black, 1 = white): from **1:1** to **21:1**
- **Measure** it: DevTools colour picker (shows the ratio and the AA / AAA
  lines), axe DevTools, WAVE, the WebAIM Contrast Checker
- Check it in the **design** phase: a palette fixed late is a palette redone

<!--
RGAA 3.2 (text contrast) and 3.3 (UI components and graphics). Large text:
18 pt (24 px) regular, or 14 pt (18.66 px) bold. Incidental text, logos
and disabled controls are exempt. Focus Appearance (2.4.13, AAA) asks
3:1 too — the focus indicator slide above.
-->

<style>
table { font-size: 0.85em; }
</style>

---

# Checklist — focus, keyboard and visual design

| ✅ Do | ❌ Avoid |
|---|---|
| Native elements: `<button>`, `<a href>` | A clickable `<div>` with no `tabindex` |
| DOM order = visual order | `flex-direction: row-reverse` on links |
| `tabindex="0"` / `"-1"` | `tabindex="1"` and above |
| A skip link, first in the `<body>` | Fifteen Tabs to reach the content |
| `:focus-visible` with 3:1 contrast | `outline: none` with nothing instead |
| Move the focus on purpose (dialog, new page) | Steal it on page load |
| `rem`, `max-width`, wrapping layouts | Fixed `width` / `height` in px |
| `prefers-reduced-motion`, `prefers-color-scheme` | Locking the orientation or the zoom |
| 4.5:1 for text, 3:1 for UI and focus | Contrast checked after the design is signed off |

<br />

> **Test it**: put the mouse away, and go through the page with Tab,
> Shift+Tab, Enter, Space and Escape. Every action must be possible, and you
> must always see where you are. Then zoom to **400 %**: still one column,
> nothing cut.

<style>
table { font-size: 0.85em; }
</style>

<!--
Recap of the chapter, and the manual test the participants will run on their
own pages. Transition: workshop 03 applies three lines of this table — the
skip link, the visible focus and the reflow at 320 px — on the Genea11y pages, graded with
`pnpm run verify --dir workshops --tp 03`. The focus trap waits for chapter 07
and workshop 07.
-->

---

# Quiz — Focus, keyboard and visual design

**`tabindex="-1"`: reached by Tab? Focusable by `.focus()`?**

- A) Reached by Tab, not focusable by `.focus()`
- B) Neither
- C) Not reached by Tab, focusable by `.focus()`
- D) Both, but last in the Tab order

<v-click>

**Answer: C** — Not by Tab, yes by `.focus()` — for a heading, `<main>`, a dialog.

</v-click>

---

# Quiz — Focus, keyboard and visual design

**Why never `tabindex="3"`?**

- A) It is invalid HTML
- B) It jumps ahead of the whole page: the order becomes unpredictable
- C) It only works on links
- D) Screen readers ignore it

<v-click>

**Answer: B** — Every positive value jumps ahead of the whole page: the order becomes unpredictable.

</v-click>

---

# Quiz — Focus, keyboard and visual design

**`outline: none` on `:focus` — what must you add?**

- A) Nothing: the browser handles it
- B) `tabindex="0"`
- C) `aria-hidden="true"`
- D) A visible `:focus-visible` style, 3:1 contrast

<v-click>

**Answer: D** — A visible `:focus-visible` style, 3:1 contrast — WCAG 2.4.7.

</v-click>

---

# Quiz — Focus, keyboard and visual design

**WCAG 1.4.10 Reflow: what must work at 320 CSS px wide?**

- A) The page, with a horizontal scrollbar
- B) The page in a single column, no horizontal scroll for its text
- C) Only the navigation
- D) Nothing: 320 px is a phone, mobile is out of scope

<v-click>

**Answer: B** — One column, no horizontal scroll — the same test as a 1280 px screen zoomed to 400 %.

</v-click>

---
layout: cover
---

# Workshop 03

## Focus, skip link and reflow

<!--
Transition: workshop 03 adds the skip link, a visible focus style and a layout that reflows at 320 px to both pages. `pnpm run verify --tp 03` checks them; then Tab through the page by hand. Next chapter: semantic HTML — the landmarks, the navigation and the table of the same app.
-->
