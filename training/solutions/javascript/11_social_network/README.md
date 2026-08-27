# TP 11 — Mini-project 4: Mini social network

> Day 3, guided practice. ~1h30 — the final project.

## Goal

Everything from the three days in one page: an array of objects as the single
source of truth, a form, a feed, per-message actions, and a live character
counter. Nothing new — the difficulty is holding the pattern while the code
grows.

## Setup

Open `index.html`. `app.js` gives you the three sections and nothing else.

## Steps

1. **The state** — one array of messages. Each message is an object:
   `{ id, author, text, likes, createdAt }`. `id` is what lets you find a
   message again after a click: generate it with `crypto.randomUUID()`.
2. **Publish** — on `submit`: `preventDefault()`, validate (an author, a text,
   at most 280 characters), build the object, **add it at the front** of the
   array, re-render, clear the text field but **keep the author**, and give the
   focus back.
3. **The feed** — newest first. Each message shows the author, its initials as
   an avatar, the text, a relative time ("just now", "3 min ago"), a *Like*
   button with its counter, and a *Delete* button.
4. **Like** — increments `likes` **in the array**, then re-renders. If you find
   yourself doing `counter.textContent++`, you have left the pattern: the array
   would no longer be the truth.
5. **Delete** — removes the message from the array by its `id`
   (`messages.filter(...)`), then re-renders.
6. **Character counter** — `0 / 280` live, red past 280, and *Publish* disabled
   while the message is empty or too long.
7. **Empty feed** — a "Nothing here yet" message instead of a blank page.
8. **Never `innerHTML`** — the text comes from a user. Post
   `<img src=x onerror="alert(1)">` in your own feed and check that it appears
   as text. If an alert opens, you have just written the most common
   vulnerability on the web.

## Checking your work

- Publishing three messages puts the newest at the top.
- Liking message 2 does not touch messages 1 and 3, and the count survives the
  publication of a fourth.
- Deleting a message removes exactly that one.
- Emptying the feed shows the message again.
- The `<img src=x onerror=...>` post is displayed, not executed.

## Going further

- **Persistence** — save the array to `localStorage` on every change
  (`JSON.stringify`) and reload it at startup (`JSON.parse`). Careful:
  `localStorage` only stores strings, and a `Date` does not survive the round
  trip — which is why `createdAt` is stored as a number here.
- **Live relative time** — "3 min ago" becomes wrong on its own. Refresh the
  feed every 30 seconds with `setInterval`, or use `Intl.RelativeTimeFormat` for
  properly localised output.
- **Edit** — the operation that forces a real form of state management: which
  message is being edited, and how does the render know?
- **Event delegation** — replace the two listeners per message with two
  listeners on the feed, using `event.target.closest('[data-id]')`. At 500
  messages this is no longer optional.
- Compare your `render()` with what React does: same idea (state ➜ view), except
  it computes the difference for you instead of rebuilding everything.
