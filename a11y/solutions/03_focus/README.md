# TP 3 — Focus, skip link and reflow — the solution

> The worked answer of `workshops/03_focus/`. Compare **after** trying: diff the
> two folders to see every change.

```bash
diff -r workshops/03_focus solutions/03_focus
pnpm run verify --tp 03          # every line OK
```

## Where learners get stuck

Most often:

- **The skip link is hidden with `display: none`** or `visibility: hidden`: it
  never gets the focus. `verify` then reports the first Tab on *Home*.
- **The skip link is not the first element of the `<body>`**: added inside the
  `<header>`, after the links, it is no longer the first Tab stop.
- **Enter scrolls, but the next Tab goes back to the header**: `tabindex="-1"` is
  missing on `<main>`. Show it in Firefox and Safari, where it is most visible.
- **`:focus` instead of `:focus-visible`**: the ring appears after every mouse
  click on a button. Not a WCAG failure, but users complain — the reason
  designers ask for `outline: none`.
- **The outline is invisible on the header**: the blue on blue is 1:1. Measure
  it live with the devtools colour picker: the yellow `#ffbf47` gives 3.15:1 on
  the light-theme blue, 5.3:1 on the dark one.
- **Testing with the mouse**: ask everyone to put the mouse aside for the
  whole check.
- **The reflow is fixed with `overflow-x: hidden`** on the `<body>`: the
  scrollbar goes, and the content is cut instead. `verify` still reports the
  wide `<main>`. The fix is a maximum width, not a hidden overflow.
- **Testing the reflow by shrinking the window**: most desktop browsers stop
  at about 500 px. Use the device toolbar at 320 px, or zoom to 400 %.
