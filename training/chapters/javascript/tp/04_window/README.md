# TP 4 — The window

> Autonomous workshop — chapter 4 (The window). ~45 minutes.

## Goal

Read what the browser knows about itself, and schedule code in time with
`setTimeout` / `setInterval` — the two functions the Day 3 countdown is made of.

You have not seen the DOM yet (chapter 5). So `ui.js` gives you one helper,
`show(id, text)`, to display a result in the page. Use it as a black box today;
you will write it yourself tomorrow.

## Setup

Open `index.html`, console visible. The page is deliberately long so that you
can scroll.

## Steps

1. **Read the window** — display the viewport size, the current URL, and the
   browser language in the page (`show(...)`) *and* in the console.
2. **A delayed message** — after 2 seconds, replace the "waiting..." text with a
   message. Use `setTimeout`.
3. **A cancelled message** — schedule a second `setTimeout` at 5 seconds, then
   cancel it immediately with `clearTimeout`. Prove it never runs.
4. **A ticking timer** — with `setInterval`, count from 10 down to 0, one step
   per second, displaying each value. At 0, **stop the interval** and display
   "Liftoff!". Forgetting `clearInterval` is the mistake to make once, in the
   console, on purpose: watch the numbers go negative.
5. **Back to top** — the button at the bottom must scroll back to the top
   smoothly. The click wiring is given; you write the `scrollTo` call.
6. **Live size** — the size shown in step 1 becomes wrong as soon as you resize
   the window. Note it; chapter 7 fixes it.

## Checking your work

- The three values of step 1 appear in the page.
- The delayed message appears after 2s, the cancelled one never appears.
- The countdown ticks 10, 9, ... 0, then stops. It must stop.
- The button scrolls smoothly back to the top.

## Going further

- `setTimeout(fn, 0)`: log `'A'`, then `setTimeout(() => console.log('B'), 0)`,
  then `'C'`. Predict the order before running it. Why is `B` last?
- `setInterval` drifts: over a long countdown it loses time. Measure it with
  `Date.now()` and read up on how a real timer recomputes from a target date
  instead of counting ticks. Day 3's countdown will care.
- `window.location.reload()`, `location.search` — parse a `?name=` query string
  with `new URLSearchParams(location.search)`.
- `navigator.onLine`, and the `online` / `offline` events.
- **Formatting** — display `new Date()` and the price `1234.5` twice, once with
  `navigator.language` and once with `'fr-FR'` / `'en-US'` forced:

  ```javascript
  new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date());
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(1234.5);
  ```

  Then show "in 3 hours" / "yesterday" with `Intl.RelativeTimeFormat`. Building
  those strings by hand is a bug in every language but yours.
- **`Temporal`** — in a Chrome 144+ or Firefox 139+ console, type
  `Temporal.Now.plainDateISO()`, then `.add({ days: 30 })`. Compare with what
  `new Date()` forces you to write for the same result. Safari still needs the
  polyfill, which is why the workshop stays on `Date`.
