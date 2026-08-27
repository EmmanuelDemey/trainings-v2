# TP 7 — Responsive behaviour

> Autonomous workshop — chapter 7 (JavaScript and responsive design). ~45 min.

## Goal

Make the **behaviour** of the page — not just its style — depend on the size of
the window, and see why `matchMedia` beats `resize` for that job.

## Setup

Open `index.html` and resize the browser window (or use the device toolbar of
the devtools, `Ctrl+Shift+M`). Keep the console open.

## Steps

1. **Live width** — display `window.innerWidth` in `#width`, updated on every
   `resize`. Count the events in the console: drag the window edge slowly and
   watch how many fire per second.
2. **A `mobile` class** — under 768px, `<body>` gets the `mobile` class; at or
   above, it loses it. Write **one** `applyLayout()` function, call it on
   `resize` **and once at startup** — forgetting the startup call is the classic
   bug: the page is wrong until the first resize.
3. **Same thing with `matchMedia`** — rebuild step 2 with
   `window.matchMedia('(max-width: 767px)')` and its `change` event. Log both,
   resize, and compare the two counters. Then answer: **why** does one fire
   hundreds of times and the other twice?
4. **Burger menu** — under 768px the navigation is hidden and the ☰ button
   appears; above, the navigation shows and the button disappears. Clicking ☰
   toggles the menu.
5. **The bug to hit on purpose** — open the menu on mobile, then widen the
   window past 768px, then narrow it again. If the menu reopens by itself, your
   *"is it open"* state and your *"are we on mobile"* state are fighting. Fix it
   by closing the menu when leaving mobile.
6. **`prefers-reduced-motion`** — `matchMedia` is not only about width. Log
   whether the user asked for reduced motion, and use it to decide between
   `behavior: 'smooth'` and `'auto'`.

## Checking your work

- The width updates live and matches the devtools.
- The badge says `mobile` / `desktop` and switches exactly at 768px.
- The `resize` counter climbs fast, the `matchMedia` counter only increments
  when crossing 768px.
- The burger menu works and does **not** reopen on its own after a resize.

## Going further

- **Debounce** the `resize` handler: only run 150ms after the last event
  (`clearTimeout` + `setTimeout` — chapter 4 again). Compare the counters.
- Keep the breakpoint in **one** place: read it in JS from a CSS custom
  property, with `getComputedStyle(document.documentElement).getPropertyValue('--bp')`.
  Two sources of truth is how a burger menu ends up half-broken at 767px.
- `ResizeObserver` — when it is the *element* and not the *window* whose size
  matters (a resizable panel, a chart in a flexible column).
- Give the ☰ button an `aria-expanded` attribute and keep it in sync. That is
  what makes the menu usable with a screen reader.
