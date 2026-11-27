# TP 8 — An automated audit — the solution

> The worked answer of `workshops/08_automated_audit/`. Compare **after** trying: diff the
> two folders to see every change.

```bash
diff -r workshops/08_automated_audit solutions/08_automated_audit
pnpm run verify --tp 08          # every line OK
```

## Where learners get stuck

The defects slipped into the starter, and how learners meet them:

- **The logo has no `alt`** (`image-alt`, both pages). Expect `alt="Genea11y
  logo"`: the `<h1>` is then read "Genea11y logo Genea11y". The logo sits next
  to the name, so it is decorative: `alt=""`.
- **`create.html` has no `lang`** (`html-has-lang`). Only on that page: a
  reminder to audit every page, not just the home one.
- **The footer text is too light** (`color-contrast`, `#a3aebd`). The fix is the
  existing `var(--color-text-light)`, not a new hard-coded grey.
- **The error red fails on the error summary** (`color-contrast` ×3, only with
  the form in error). `#dc2626` passes on white but reaches 4.41:1 on the pink
  background. Learners who only scan the page at load never see it: that is the
  point of step 3. Change `--color-error`, which is used in five places.
- **The ✕ close button lost its `aria-label`**: axe does **not** report it, the
  button has a text ("✕"), just not a meaningful one. Only `verify` catches it,
  or a screen reader announcing the symbol name ("multiplication x, button")
  instead of "Close". It is the best example for
  step 5.
- **"Lighthouse says 100, we are done"**: the dialog-open scan passes on the
  starter despite the ✕ defect. Use it to close the workshop.
- **Lighthouse runs fewer rules than axe DevTools**: do not expect more from
  running both; the difference comes from the states, not the tool.
