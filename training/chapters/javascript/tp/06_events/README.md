# TP 6 — Interactive interfaces

> Autonomous workshop — chapter 6 (Event-driven programming). ~1h15.

## Goal

Four small interfaces, four event families: `click`, `input`, `submit`, and
`keydown`. From here on, no helper is given — DOM and events are both yours.

## Setup

Open `index.html`, console visible.

## Steps

1. **Counter** — `+` and `-` update a number displayed in the page. The `-`
   button must be disabled at 0 (`button.disabled = true`) and the *Reset*
   button brings it back to 0. Keep the count in a variable, **not** by reading
   the text back from the page.
2. **Character counter** — under the text field, show `12 / 100`. It must update
   on **every keystroke** (`input`, not `change` — try both and feel the
   difference). Past 100 characters, add the `error` class to the counter.
3. **Form validation** — on `submit`: block the reload with `preventDefault()`,
   then check that the name is not empty and that the email contains an `@`.
   Errors go **into the page**, next to the field, never into an `alert`. On
   success, show a confirmation and clear the form.
4. **Mini todo-list** — a form adds a task to the list. Clicking a task toggles
   a `done` class (line-through). A *Delete* button removes it. The form must
   refuse an empty task and give focus back to the field after each add.
5. **Keyboard** — pressing `Escape` anywhere clears the todo input.
6. **Add and remove** — the *Mute the counter* checkbox must add or remove the
   console listener on the counter. This is where `removeEventListener` forces
   you to keep a **named function**: an inline arrow cannot be removed.
7. **Delegation** — rewrite the todo-list with **one** listener on the `<ul>`
   instead of two per task. Use `event.target` to know what was clicked and
   `closest('li')` to find the row. Check that it still works for tasks added
   *after* the listener was registered — that is the property that matters.
8. **Unplug your mouse** — go through the whole page with `Tab`, `Enter` and
   `Space`. Everything must be reachable and usable. If something is not, it is
   almost certainly a `<div>` that should have been a `<button>`.

## Checking your work

- The `-` button is greyed out at 0, never goes negative.
- The character counter reacts on every keystroke and turns red past 100.
- Submitting an empty form does **not** reload the page and shows two messages.
- Adding, striking through and deleting a task all work; `Escape` clears the field.
- Ticking *Mute* stops the console logs; unticking brings them back.
- The whole page can be operated from the keyboard alone.

Or have it checked for you:

```bash
npm run verify:javascript -- --dir chapters/javascript/tp --tp 06
```

## Going further

- `event.stopPropagation()` — add a listener on the `<li>` *and* on its delete
  button, and watch the click fire both. That is bubbling, and delegation is
  only possible because of it.
- `event.currentTarget` inside your delegated listener: it is the `<ul>`, always,
  while `event.target` changes with every click. Log both.
- `{ once: true }` on the submit listener: what breaks?
- Replace your `@` check with the browser's own validation
  (`<input type="email" required>` + `form.checkValidity()`), and decide which
  one you would ship.
