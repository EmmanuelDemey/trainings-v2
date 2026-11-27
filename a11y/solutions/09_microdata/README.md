# TP 9 — Microdata — the solution

> The worked answer of `workshops/09_microdata/`. Compare **after** trying: diff the
> two folders to see every change.

```bash
diff -r workshops/09_microdata solutions/09_microdata
pnpm run verify --tp 09          # every line OK
```

## Where learners get stuck

Most often:

- **`row.itemScope = true`**: the microdata DOM API (`itemScope`, `itemType`,
  `itemProp`) was never shipped in Chrome and was removed from Firefox. The
  property is silently ignored. Use `setAttribute`.
- **`setAttribute('itemscope')`** without a value throws: the second argument
  is required. An empty string is enough.
- **A short `itemtype`**: `Person` or `schema.org/Person` is not a type. It must
  be the full URL, `https://schema.org/Person`, which is also what `verify`
  looks for.
- **Invented property names**: `firstName`, `lastName`, `birthday`. They are
  the names of the JavaScript object, not of schema.org. The validator reports
  them as unknown; `verify` finds no `givenName`.
- **`itemprop="birthDate"` on the `<td>`** instead of the `<time>`: the value
  becomes the cell text. It works here because the text is already
  `YYYY-MM-DD`, but it breaks as soon as the date is formatted for humans.
- **Testing the page source**: *View source* shows an empty `<tbody>`, the rows
  are rendered by `script.js`. Copy the outer HTML from the Elements panel,
  after the render.
- **"Nothing changed"**: that is the expected result. Microdata is invisible to
  the eyes and to screen readers; only the validator and `verify` see it.
