# TP 2 — A manual audit: a sample report

> The expected outcome of workshop 2: a sample audit of `workshops/03_focus/`, the Genea11y starter, with each issue mapped to its WCAG criterion, and to its RGAA 4.1.2 criterion.

If you audited your own app, your report will be different: use this one to
check its **form** — one issue per line, a criterion with its level, a fix a
developer can apply.

## Audited pages

`workshops/03_focus/index.html` (the list of people) and
`workshops/03_focus/create.html` (add a person), in Chrome and Firefox, with
the keyboard and NVDA.

## The issues

| # | Issue | Where | WCAG criterion | RGAA 4.1.2 | Fix |
|---|---|---|---|---|---|
| 1 | **No skip link.** A keyboard user has to tab through the header links on every page before reaching the content. | both pages | 2.4.1 Bypass Blocks (A) | 12.7 | A first link in the `<body>`, `<a class="skip-link" href="#main">Skip to main content</a>`, hidden until it gets the focus. *Workshop 3.* |
| 2 | **No focus style of our own.** The page relies on the browser's default ring, which differs in every browser, is thin, and can be hard to see on the blue header. Nothing in the CSS guarantees a visible, contrasted indicator. | header links, every link and button | 2.4.7 Focus Visible (AA), and 1.4.11 Non-text Contrast (AA) for the contrast of the indicator | 10.7 (and 3.3 for the contrast) | A `:focus-visible` outline of at least 2px on links and buttons, with a colour that reaches 3:1 against each background (a yellow one in the blue header). *Workshop 3.* |
| 3 | **The navigation is not a navigation.** The two header links are loose `<a>` elements: no `<nav>` landmark, no list. A screen reader user cannot jump to the menu, and does not hear *"list, 2 items"*. | header, both pages | 1.3.1 Info and Relationships (A) | 9.3 (list), 12.6 (zone) | `<nav aria-label="Main menu"><ul><li>…</li></ul></nav>`. *Workshop 4.* |
| 4 | **The current page is not indicated**, neither visually nor to assistive tech. | header, both pages | 1.3.1 Info and Relationships (A); 2.4.8 Location (AAA) | none: 2.4.8 is AAA, outside the RGAA — a recommendation | `aria-current="page"` on the link of the current page, and a visible style for it (bold, underline): not colour alone. *Workshop 4.* |
| 5 | **The list of people is a grid of `<div>`s.** It looks like a table, but it is read as a flat list of words: no rows, no column headers, no *"Last name, column 1"* when moving through it. The header row is just bold text. | `index.html`, `#people` | 1.3.1 Info and Relationships (A) | 5.6, 5.7 (and 5.4 once it has a caption) | A real `<table>` with a `<caption>`, `<th scope="col">` headers in a `<thead>`, and one `<tr>` per person in the `<tbody>`. *Workshop 4.* |
| 6 | **The dates are not machine-readable**: `1980-05-15` is plain text. | `index.html`, birth date column | 1.3.1 Info and Relationships (A) — best practice more than a strict failure | none | `<time datetime="1980-05-15">`. *Workshop 4.* |
| 7 | **The "Add a person" page has no form**: the task the page is named after cannot be done, by anyone. When the form arrives, it must have labels, groups and announced errors. | `create.html` | Functional defect first; for the form to come: 1.3.1 (A), 3.3.1 Error Identification (A), 3.3.2 Labels or Instructions (A), 4.1.2 Name, Role, Value (A) | for the form to come: 11.1, 11.2, 11.5, 11.10, 11.11, 11.13 | Build the form with `<label for>`, `<fieldset>`/`<legend>`, `required`, `autocomplete`, and errors tied with `aria-describedby`. *Workshop 5.* |

What is **fine** in this starter, and worth saying in a report too: both pages
have `lang="en"`, a meaningful and distinct `<title>`, `<header>`, `<main>` and
`<footer>` landmarks, and the text contrasts pass AA (white on the blue header
is 5.2:1, the grey footer text 4.55:1 — just above the 4.5:1 threshold; 8.7:1
and 5.7:1 in dark mode). At 320 px wide nothing scrolls horizontally, and the
pages have no image, so nothing falls under 1.1.1. In RGAA terms: 8.3, 8.5,
8.6, 3.2 and 10.11 are compliant.

## What to fix first

Issues 1 and 2: the keyboard. As long as the focus cannot be seen, a keyboard
user cannot use the page at all, and every other fix is wasted on them. Then 3
and 5, the structure, which is what a screen reader user navigates by.

## The typical mistakes in a report

- A criterion without its level, or a level without its criterion.
- *"Not accessible"* as a description: say **what** fails, **where**, and for
  **whom**.
- A fix that adds ARIA where an HTML element would do: `role="table"` on the
  `<div>`s instead of a `<table>`, `role="navigation"` instead of a `<nav>`.
- Counting the same issue twice because it appears on two pages: one line, with
  *both pages* in the *Where* column.
- Taking a WCAG number for an RGAA one: *1.1.1* is a WCAG success criterion,
  *1.1* the RGAA criterion that tests it. Each RGAA criterion lists, under
  *Références*, the WCAG criteria it covers.

## Running the workshop

- Before the audit, demo **one** issue on the projector, from the symptom to
  the table row: Tab from the top of `index.html`, the focus goes through the
  header links before the content, so *no skip link*, *2.4.1 (A)*, *RGAA 12.7*,
  and the fix. Then let them work.
- Pairs work well: one on the keyboard and the screen reader, one writing.
  Stop the audit after 30 minutes, whatever is left, and keep 15 minutes to
  write the report and go through this sample together.
- The HTML of the starter holds `TODO workshop N` comments that give the
  answers away. Ask the learners to audit **in the browser first**, and to open
  the source only to confirm what they found.
- Issue 2 is the debated one: the default ring of Chrome passes RGAA test
  10.7.1 (*the native focus style is not removed*) as long as it stays
  contrasted; what fails is that nothing in the CSS guarantees it. Accept
  *"compliant, to improve"* when a learner argues it: the argument is the point.
- The table (issue 5) is often missed because it *looks* right: ask them to
  move through it with the table keys of the screen reader (Ctrl + Alt +
  arrows in NVDA). Nobody finds an issue under *Text alternatives*: there is no
  image, and saying so is a valid answer.
- Few report 7 on their own, since an empty page has *"no accessibility
  problem"*: the moment to say that a task nobody can complete fails everyone,
  and that an audit covers the tasks, not only the markup.
- For the learners who audited their own app, check the **form** of their
  table (one issue per line, a criterion with its level, a concrete fix), not
  its content.
