# TP 1 — First steps

> Autonomous workshop — chapter 1 (Introduction). ~30 minutes.

## Goal

Get comfortable with the two tools you will use for the next three days: the
**developer tools** and the **console**. Then load your first script into a page.

## Setup

Open `index.html` in your browser, then press **F12** to open the devtools.

## Steps

1. **Elements panel** — find the `<h1>` in the tree, double-click its text and
   change it to your name. Reload: your change is gone. *Why?*
2. **Console as a REPL** — type these one by one and read the result:
   ```javascript
   2 + 3
   'Emmanuel'.toUpperCase()
   Math.max(4, 12, 7)
   typeof 42
   ```
3. **Your first script** — `index.html` already loads `app.js` with `defer`.
   In `app.js`, complete the TODOs: a `console.log`, a `console.table`, a
   `console.error`, and read the `document.title`.
4. **Read an error** — at the end of `app.js`, uncomment the broken line. Read
   the message *and* the line number in the console, then comment it back.
5. **`defer`** — move the `<script>` tag into the `<head>` and remove `defer`.
   The `document.title` log still works, but reload and watch: the script now
   runs before the `<h1>` exists. Put `defer` back.
6. **A breakpoint** — open the **Sources** panel, find `app.js`, click the line
   number of the `console.table` call, and reload. The page freezes there.
   - read the **Scope** pane: `languages` is already defined
   - type `languages[0].name` in the console — it answers **in the paused context**
   - **F10** steps over the line, **F8** resumes
7. **`debugger;`** — write that single word on a line of `app.js`, reload, and
   see the same thing happen. Then delete it. Never commit it.

## Checking your work

The console shows four groups of output and no red error (except in step 4,
where the error is the point). Run `pnpm run verify:javascript --dir
chapters/javascript/tp --tp 01` to have it checked for you.

## Going further

- `console.warn`, `console.count()`, `console.group()` / `console.groupEnd()`.
- In the **Network** panel, reload and find the request that loaded `app.js`.
- A **conditional breakpoint**: right-click a line number ➜ *Add conditional
  breakpoint* ➜ `languages.length > 2`. It only stops when that is true.
- **Pause on exceptions** (the ⏸ icon with a stop sign): reload with the broken
  line of step 4 uncommented, and land exactly on the crash.
