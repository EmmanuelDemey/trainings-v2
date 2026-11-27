# TP 5 — Accessible forms — the solution

> The worked answer of `workshops/05_forms/`. Compare **after** trying: diff the
> two folders to see every change.

```bash
diff -r workshops/05_forms solutions/05_forms
pnpm run verify --tp 05          # every line OK
```

## Where learners get stuck

Most often:

- **A `placeholder` instead of a `<label>`**: it looks labelled, but the text
  vanishes on typing and many screen readers skip it. `verify` finds the fields
  by their label, so it fails on *"labelled fields"*.
- **`for` pointing at the `name`, not the `id`**: `for="lastName"` ties nothing.
  Clicking the label is the quickest test: the field must take the focus.
- **`novalidate` forgotten**: the browser bubble shows up first and the submit
  handler never runs; `verify` then fails on *aria-invalid*.
- **The summary built once and only toggled**: a `role="alert"` region already
  in the page, its content swapped, is not always re-read. Removing it and
  inserting a new one on each submit (as the steps say) is the reliable way.
- **The alert cut short by the focus move**: NVDA and VoiceOver may read the
  focused field over the summary. It is expected; the summary is still reached
  by Shift+Tab, and the field message is read through `aria-describedby`. Let
  learners hear it rather than hide it.
- **The same success twice is silent**: writing the same text into the
  `role="status"` paragraph does not trigger a new announcement. That is why
  it is emptied on an error submit; the *Going further* blur idea makes it
  audible.
- **Old messages piling up**: `setFieldError` must remove the previous
  `#…-error` first, or every submit adds one more message under the field.
- **`aria-describedby` left on a fixed field**: it points at a removed id. Harmless
  by ear, but `verify` checks that a fixed field is clean.
- **`innerHTML` for the messages**: works, but the habit leaks to real data.
  Ask for `createElement` and `textContent`.
- **The red is 4.8:1 on white, 4.4:1 on the summary pink**: fine for the bold
  title, borderline for the links (AA asks 4.5:1 for normal text). A good
  question to ask during the debrief.
