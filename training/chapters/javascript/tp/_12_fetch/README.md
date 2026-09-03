# TP 12 — Talking to a server

> Optional workshop — chapter 9 (Talking to a server). ~1h15.
> **Must be served over HTTP** — the command is in *Setup* below.

## Goal

Replace the array written in the file by an array that **comes from a server**,
and handle what that changes: the data is not there yet, and it may never come.

By the end you can render the three states of any screen that loads something —
**loading**, **error**, **data** — which is what every real interface does.

## Setup

```bash
npx serve chapters/javascript/tp/12_fetch
# then open the printed http://localhost:3000
```

Double-clicking `index.html` gives you a `file://` page, and every `fetch` from
there is blocked. If the console says `TypeError: Failed to fetch` before you
wrote anything, that is the reason.

Keep the **Network** panel open next to the console.

## Steps

1. **A first request** — `fetch('data/products.json')`, and log what the promise
   resolves with. It is a `Response`, not your data. Log `response.status` and
   `response.ok`. Then chain `.then((response) => response.json())` and log the
   array. Find that request in the Network panel and read its response tab.
2. **Render** — write `render()` so that `state.products` becomes `<li>`
   elements, name on the left, price on the right, formatted with the `euros`
   formatter already declared at the top of `app.js`.
3. **Three states** — `#loading` shows only while the request is in flight,
   `#error` only when it failed, and `#summary` says
   `N product(s), total XX.XX €` (or `No product` on an empty array). One
   `render()` reads `state` and decides everything — the pattern of Day 3.
4. **A 404 is not an error** — point the URL at `data/nope.json` and watch: the
   promise **fulfils**, and the crash happens inside `.json()`, with a message
   about unexpected characters. Now add the check that turns it into something
   readable:

   ```javascript
   if (!response.ok) throw new Error(`HTTP ${response.status}`);
   ```

5. **`async` / `await`** — rewrite `loadProducts` with `async` / `await`, and
   `load` with `try` / `catch` / `finally`. Same behaviour, read top to bottom.
   The `finally` is where `status: 'loading'` gets turned off — in both cases.
6. **Retry** — the *Reload* button reloads the catalogue, the *Load a missing
   file* button loads `data/nope.json`. The error must be **visible in the
   page**, and a successful reload must clear it.

## Checking your work

`check.js` prints its criteria in the console one second after load. Then, by
hand: click *Load a missing file* (a readable error appears, the list empties or
stays, your call — but say which in `render`), then *Reload* (the error goes,
the list is back).

Throttle the network to *Slow 3G* in the Network panel and reload: you should
see the loading state you wrote. If you never see it, it is not wired.

## Going further

- **Abort** — the search box: one `fetch` per keystroke, each one cancelling the
  previous with an `AbortController`. Without it, a slow answer for `ab`
  overwrites the fresh answer for `abcd`. Ignore `error.name === 'AbortError'`.
- **A real API** — `https://jsonplaceholder.typicode.com/users` returns 10 users
  and allows CORS. Render them with the same `render()`.
- **`Promise.all`** — load `products.json` and a second file at the same time,
  and render only when both are there. Compare with two `await` in a row in the
  Network waterfall.
- **POST** — `fetch(url, { method: 'POST', headers, body: JSON.stringify(...) })`
  against `https://jsonplaceholder.typicode.com/posts`, which accepts anything.
  Disable the button while the request is in flight.
- **`response.text()`** on a JSON file, and `JSON.parse` by hand: what `.json()`
  actually does for you.
