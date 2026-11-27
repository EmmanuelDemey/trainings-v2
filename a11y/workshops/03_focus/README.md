# TP 3 — Focus, skip link and reflow

> Let keyboard users skip the header, always see where the focus is — and keep
> the page readable for the users who zoom it to 400 %.

**Duration**: 45 min (20 min for the focus, 10 min for the reflow, 15 min to check by hand and with `verify`) · **Chapter**: 3 — Focus and keyboard

## Goal

Chapter 3 — Two things every keyboard user needs before anything else, and one
every low vision user needs:

- a **skip link**, the first thing Tab reaches, that jumps over the header to
  the content (WCAG 2.4.1 Bypass Blocks, level A);
- a **visible focus indicator** of our own on links and buttons, contrasted
  enough to be seen on every background (WCAG 2.4.7 Focus Visible, AA, and
  1.4.11 Non-text Contrast, AA);
- a layout that **reflows** at 320 CSS px wide — the width of a 1280 px screen
  zoomed to 400 % — without a horizontal scrollbar (WCAG 1.4.10 Reflow, AA).

**Files:** `index.html`, `create.html`, `style.css`. The `TODO workshop 3`
comments mark the places.

## Setup

```bash
cd workshops/03_focus
npx serve .
```

Click in the address bar, then press **Tab** a few times. Where does the focus
go first? Can you see it on the blue header? Then zoom the page to **400 %**
(Ctrl / Cmd and +): can you read a line without scrolling sideways?

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | A skip link, first in the `<body>`, hidden until focused | `index.html`, `create.html`, `style.css` | The first Tab shows it; Enter puts the focus in `<main>` |
| 2 | A `:focus-visible` outline of our own, 3:1 on every background | `style.css` | The focus is visible on the white page **and** the blue header |
| 3 | A layout that reflows at 320 px | `style.css` (the `main` rule) | No horizontal scrollbar at 400 % zoom |

## Steps

### 1. The skip link

1. In **both** `index.html` and `create.html`, add a link **as the very first
   element of the `<body>`**, where the TODO is:

   ```html
   <a class="skip-link" href="#main">Skip to main content</a>
   ```

   The text says where it goes: it is read out, and seen when it appears.

2. `<main>` already has `id="main"`. Add `tabindex="-1"` to it as well:

   ```html
   <main id="main" tabindex="-1">
   ```

   *Why?* Following an in-page link scrolls to the target, but not every browser
   moves the **keyboard focus** there. Without it, the next Tab can start again
   from the top of the page. `tabindex="-1"` makes `<main>` focusable by script
   and by the link, without adding it to the Tab order.

3. In `style.css`, complete the `.skip-link` rule:
   - `position: absolute` at the top left of the page, with a `z-index` above
     the header;
   - **out of sight by default**: moved above the top of the page
     (`transform: translateY(-100%)`, or a negative `top`);
   - **back on screen on `:focus`** (`transform: none`, or `top: 0`);
   - readable: a dark background with light text, some padding.

   Do not hide it with `display: none` or `visibility: hidden`: those remove it
   from the Tab order, and it can never be reached.

4. `<main>` now takes the focus, and the browser draws its ring around the whole
   content. It is not a control: remove its outline with `main:focus { outline: none; }`.

→ **Done when** the first Tab shows the skip link, and Enter on it sends the
next Tab to the first link after the header.

### 2. A visible focus

1. In `style.css`, at the `TODO workshop 3` near the buttons, add a
   `:focus-visible` style on links and buttons:

   ```css
   a:focus-visible,
   button:focus-visible {
     outline: 3px solid var(--color-focus);
     outline-offset: 2px;
   }
   ```

   `:focus-visible`, not `:focus`: the browser shows it for the keyboard, not
   after a mouse click on a button. Click a button, then Tab to it, and compare.

2. Check the **contrast** of the indicator: at least **3:1** against what is
   around it. `--color-focus` is the blue of the header: on the white page it is
   fine, on the blue header it is invisible (1:1). Give the header links, and the
   skip link, an outline colour of their own — a yellow such as `#ffbf47` passes
   3:1 on that blue.

3. Never write `outline: none` on a control without putting something at least
   as visible in its place.

→ **Done when** you can Tab through both pages and always see where you are,
including on the blue header.

### 3. A page that reflows

1. Open the DevTools device toolbar, and set the width to **320 px** (or zoom
   a 1280 px window to 400 %). A horizontal scrollbar appears: the content is
   960 px wide, whatever the screen.
2. In `style.css`, find the `main` rule. Its `width: var(--max-width)` is a
   **fixed** width. Make it a **maximum** instead, and let it shrink:

   ```css
   max-width: var(--max-width);
   width: 100%;
   ```

3. Reload at 320 px: one column, no sideways scrolling. Check `create.html`
   too.

A data table may still scroll on its own at that width: WCAG 1.4.10 allows it
for content that needs two dimensions. The page around it may not.

→ **Done when** neither page scrolls sideways at 320 px.

## Checking your work

**By hand.** Reload, press Tab: the skip link appears at the top left. Press
Enter: the page jumps to the content, and the next Tab goes to the first link
**after** the header. Tab through every link of both pages: you always see where
the focus is, including on the blue header. Do it with your screen reader on:
the skip link is announced first.

**From the terminal**, in the training folder:

```bash
pnpm install
pnpm exec playwright install chromium     # once
pnpm run verify --dir workshops --tp 03
```

On both `index.html` and `create.html`, it checks that:

- the first Tab lands on a link to `#main`;
- its text says where it goes (*skip* or *main content*);
- once focused, the skip link is on screen;
- without the focus, it is out of sight;
- Enter on it moves the focus into `<main>`.

And on `index.html`, that a header link focused from the keyboard shows **your**
outline: at least 2px, and not the browser default (`auto`). Last, at 320 px
wide, that nothing but a data table overflows the window, on both pages.

A `KO` line says what it found instead, for example `-> <a> "Home"` when the
first Tab lands on the Home link.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part
of this list.

**It works**

- [ ] `pnpm run verify --dir workshops --tp 03` prints only `OK`
- [ ] `grep -n "TODO workshop 3" *.html *.css` returns nothing
- [ ] No error in the browser console

**By hand, mouse aside**

- [ ] The first Tab, on both pages, shows "Skip to main content"
- [ ] Enter on it, then Tab: the focus is on the first link after the header
- [ ] Every link and button shows a contrasted ring, on the header too
- [ ] At 400 % zoom, both pages read in one column

**You can explain**

- [ ] Why `display: none` cannot hide a skip link
- [ ] Why `<main>` needs `tabindex="-1"`, and why `-1` rather than `0`
- [ ] `:focus` versus `:focus-visible`
- [ ] Which WCAG criterion each of the three steps fixes

## Going further

- Add a skip link to the **navigation** too, or to the search box of your own
  app, when the page has several big blocks.
- Turn the outline into a double ring (`box-shadow: 0 0 0 2px white, 0 0 0 5px
  var(--color-focus)`) that shows on **any** background, light or dark. Then
  check it in Windows High Contrast mode (*forced colours*): box shadows
  disappear there, outlines do not.
- WCAG 2.2 added 2.4.11 *Focus Not Obscured* (AA): a focused element must not be
  hidden behind a sticky header or a cookie banner. Make the header
  `position: sticky` and Tab back up the page: is the focus hidden?
- Turn on the dark colour scheme of your OS: the page has one
  (`prefers-color-scheme`). Is your focus still contrasted enough?

## Useful links

- [MDN — `:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
- [WebAIM — Skip Navigation Links](https://webaim.org/techniques/skipnav/)
- [Understanding WCAG 2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html)
- [Understanding WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [Understanding WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
