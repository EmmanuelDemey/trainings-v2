# TP 6 — ARIA: a custom radio group — the solution

> The worked answer of `workshops/06_aria_radio/`. Compare **after** trying: diff the
> two folders to see every change.

```bash
diff -r workshops/06_aria_radio solutions/06_aria_radio
pnpm run verify --tp 06          # every line OK
```

## Where learners get stuck

Most often:

- **`tabindex="0"` on both radios**: the group becomes two Tab stops. `verify`
  reports it at start, and again when Tab does not leave the group.
- **The Tab stop does not follow the check**: `aria-checked` is updated but not
  `tabindex`. Shift+Tab then Tab lands back on the first radio, not on the
  checked one. Ask them to try it by hand.
- **One listener per radio, with `this` or a stale index**: it works, but the
  index computed at load breaks as soon as a radio is added. Push for one
  listener on the group and `radios.indexOf(document.activeElement)`.
- **`keyup` instead of `keydown`**: `preventDefault()` comes too late, the page
  has already scrolled on Space and the arrows.
- **`event.key === 'Space'`**: the key is `' '`. `'Spacebar'` is only old Edge.
- **Moving the focus without checking**: that is the toolbar or listbox
  behaviour, not the radio group one. In a radio group, the arrows move **and**
  check (APG).
- **The checked state shown by colour only**: the given style changes the
  border colour and a light background. That is the question of step 3: a dot
  (`::before`) or a check mark makes it pass WCAG 1.4.1 Use of Color.
- **Nothing in the form data**: the success message does not show the sex. It
  is expected — that is the first *Going further*, and the best argument for
  the native element.
