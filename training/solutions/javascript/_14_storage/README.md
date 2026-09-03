# TP 14 — Remembering

> Optional workshop — chapter 11 (Local & Session Storage). ~1h.
> **Must be served over HTTP** — the command is in *Setup* below.

## Goal

Make a to-do list survive a reload. The application is already written — the
state, the render and the handlers are the pattern of Day 3, untouched. You add
**two functions**, `save()` and `load()`, and plug them in at the right place.

## Setup

```bash
npx serve chapters/javascript/tp/14_storage
# then open the printed http://localhost:3000
```

Chrome denies `localStorage` on a `file://` page, so double-clicking gives you a
`SecurityError` before anything else.

Open the **Application** panel of the devtools, section *Local Storage*: you
will watch your own writes appear there, and you can edit them by hand.

## Steps

1. **In the console, first** — before touching `app.js`:

   ```javascript
   localStorage.setItem('count', 3);
   localStorage.getItem('count');        // '3' — a string, always
   localStorage.getItem('count') + 1;    // '31' 😱
   localStorage.setItem('user', { name: 'Ada' });
   localStorage.getItem('user');         // '[object Object]'
   localStorage.clear();
   ```

   That is the whole API, and the whole trap.
2. **Write** — fill `save()`: `JSON.stringify(state.todos)` under `TODOS_KEY`.
3. **Read** — fill `load()`: read the key back, `JSON.parse` it, and return the
   array. Three cases must give `[]` and never a crash: the key is missing
   (`JSON.parse(null)` returns `null`), the value is not JSON (it **throws**),
   and the value is not an array. Then start the state from `load()`.
4. **One funnel** — call `save()` from `update()`, and from nowhere else. Every
   change already goes through it: adding, ticking, removing. Now reload, and
   the list is still there.
5. **Clear** — the *Clear everything* button empties the state **and**
   `removeItem`s the key. Watch the line disappear from the Application panel.
6. **The draft** — the textarea keeps its content in **`sessionStorage`**, saved
   on every `input` event and restored at startup. Reload: it is back. Open the
   same URL in a **new tab**: it is empty, while the to-do list is there. That
   difference is the whole point of the two APIs.

## Checking your work

`check.js` runs on load. All red on the first visit is expected: **add a task,
then reload**. It also checks that what the page displays matches what is
stored — the bug you get when you save in one place and render from another.

By hand: tick a task, reload, it is still ticked. Clear everything, reload, the
list stays empty.

## Going further

- **Two tabs** — listen for the `storage` event and re-render. Open the page
  twice side by side and add a task in one. Note that the event fires in the
  *other* tabs only.
- **Versioning** — change the shape of a todo (rename `text` to `label`) and
  reload with old data in storage. Then bump the key to `.v2` and see why the
  version is in the name.
- **The quota** — `localStorage.setItem('big', 'x'.repeat(10_000_000))` in the
  console. Read the `QuotaExceededError`, then wrap your `save()` in a
  `try` / `catch` so a full storage degrades instead of breaking the app.
- **Private mode** — open the page in a private window and check that it still
  works. Storage is a convenience, never the source of truth.
- **What you must not store** — type `localStorage.setItem('token', 'abc')`,
  then read it back from the console. Any script on the page can do exactly
  that. Compare with an `HttpOnly` cookie, which JavaScript cannot read at all.
