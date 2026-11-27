# TP 7 — Complex components: a modal dialog — the solution

> The worked answer of `workshops/07_modal/`. Compare **after** trying: diff the
> two folders to see every change.

```bash
diff -r workshops/07_modal solutions/07_modal
pnpm run verify --tp 07          # every line OK
```

## Where learners get stuck

Most often:

- **The ✕ without `aria-label`**: it is announced *"multiplication x"*, or
  nothing. `verify` reports that both close buttons must be named *Close*.
- **A `.sr-only` text placed first**: *"Marie Martin View details"* breaks
  2.5.3 Label in Name for voice control users. The visible text must start the
  name.
- **One listener per button**, added in `renderPeople()`: it works, but it is
  lost each time the table is rendered again. Push for one listener on
  `#people` with `closest('.btn-details')`.
- **The focus moved before `is-open`**: `focus()` on an element still in
  `display: none` does nothing. Show the dialog first, then move the focus.
- **`inert` on `body`**: the dialog is in `body`, so it becomes inert too, and
  nothing can be focused. Only the siblings of the dialog go inert.
- **`aria-modal` without `inert`**: Tab still reaches the page in some
  browsers, and the virtual cursor of some screen readers still reads it.
  `verify` checks that `header` and `main` are inert.
- **The focusable list read once, at open**: it works here, but breaks as soon
  as the content of the dialog changes. Read it on each Tab.
- **Escape listened on `document`, never removed**: it fires when the dialog
  is closed and sends the focus to a stale trigger. Listen on the dialog, and
  guard `closeDialog()` when it is already closed.
- **The focus not given back**: it falls to `<body>`, and the keyboard user
  starts again from the top of the page. Ask them to try it by hand.
