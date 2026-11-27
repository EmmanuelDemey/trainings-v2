# TP 4 — Semantic HTML — the solution

> The worked answer of `workshops/04_semantic_html/`. Compare **after** trying: diff the
> two folders to see every change.

```bash
diff -r workshops/04_semantic_html solutions/04_semantic_html
pnpm run verify --tp 04          # every line OK
```

## Where learners get stuck

Most often:

- **`aria-current="page"` copied on the same link in both pages**: in
  `create.html`, it goes on *Add a person*. `verify` names the page and the link.
- **`aria-current` written as `class="active"`**: nothing is announced. Use it to
  show why the CSS styles from the attribute.
- **The `id="people"` left on a `<div>` around the table**: `script.js` then
  appends the rows outside the `<tbody>`. It has to move to the `<tbody>`.
- **`<th>` without `scope`**: screen readers often guess right on a simple table,
  so it "works" by ear — `scope="col"` makes it reliable, and `verify` checks it.
- **The rows built with `innerHTML`**: it passes the checks, but it is an XSS
  hole on real data. Ask for `createElement` and `textContent`.
- **`list-style: none` and Safari**: VoiceOver on Safari may stop announcing a
  list without bullets. Mention it; the menu here is short enough not to matter.
