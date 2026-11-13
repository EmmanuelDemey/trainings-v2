# TP 2 — A manual audit

> Find the accessibility problems of a web page by hand, map each one to its WCAG criterion, and propose a fix.

## Goal

Chapter 3 — The law refers to the WCAG (and, in France, to the RGAA built on
them). Before any tool, learn to **find problems yourself**, to **name the
criterion** each one breaks, with its level (A, AA, AAA), and to **propose a
fix**. Automated tools find roughly a third of the problems: the rest is this
workshop.

There is no code to write, and nothing to run `verify` on.

## Setup

Choose the page you audit:

- **one of your own apps**, the one you work on (the most useful choice), or
- the starter of the next workshop, **`workshops/03_focus/`**: the Genea11y app
  as you will start it. It has many issues on purpose. Serve it and open it:

  ```bash
  cd workshops/03_focus
  npx serve .
  ```

Keep your screen reader from workshop 1 at hand, and the
[WCAG quick reference](https://www.w3.org/WAI/WCAG22/quickref/) open in a tab.

## Steps

Go through the page with the checklist below. For each problem, write down
what you see, where, and who it blocks.

1. **Keyboard** — put the mouse away. With **Tab**, **Shift+Tab**, **Enter** and
   **Space**, can you reach and use everything? Can you always **see** where the
   focus is? Is the order logical? Is there a way to skip the repeated header?
2. **Text alternatives** — images, icons, icon-only buttons: does each one have
   an alternative that says what it is for? Are decorative images ignored?
3. **Colour and contrast** — is the text readable against its background
   (4.5:1 for body text, 3:1 for large text and for the borders of controls and
   focus indicators)? Is any information given by colour alone? The devtools
   colour picker shows the contrast ratio.
4. **Structure** — is there one `<h1>`? Do the headings follow a logical order?
   Are there landmarks (`header`, `nav`, `main`, `footer`)? Are lists real lists
   and tables real tables?
5. **Forms** — does every field have a visible label tied to it? Are required
   fields announced? Are errors announced, and tied to their field?
6. **Screen reader** — go through the page with it. What is announced
   differently from what you see?
7. **Zoom** — zoom to 200 %, then 400 %. Does anything overlap, get cut, or need
   horizontal scrolling?

## Deliverable

A **mini report of at least 5 issues**. For each one:

- the **description** of the problem, and where it is;
- the **WCAG criterion** it breaks, with its number and level — for example
  *1.1.1 Non-text Content (A)*;
- the **fix** you propose.

A table is enough:

| # | Issue | Where | WCAG criterion | Fix |
|---|---|---|---|---|
| 1 | The logo has no text alternative | header, every page | 1.1.1 Non-text Content (A) | `alt="Genea11y"`, or `alt=""` if the name is also written next to it |

Finish with a sentence or two: which issue would you fix first, and why?

## Checking your work

Nothing automated. You are done when:

- your report lists at least 5 distinct issues;
- each one has a WCAG criterion number **and** its level;
- each fix is concrete enough for a developer to apply without asking you.

If you audited `workshops/03_focus/`, compare your report with the sample in
`solutions/02_manual_audit/`. The next workshops fix those issues one by one.

## Going further

- Classify your issues by **impact** too (blocks a task, slows it down, an
  annoyance): the level of a criterion does not tell how bad a failure is for a
  user.
- Redo the audit with the **RGAA** checklist: map each of your issues to an RGAA
  criterion, and notice how much more precise the RGAA tests are.
- Write the *accessibility statement* (*déclaration d'accessibilité*) that the
  page would need today: conformance status, known non-conformities, contact.

## Useful links

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [How to Meet WCAG — quick reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Easy Checks — a first review of web accessibility](https://www.w3.org/WAI/test-evaluate/preliminary/)
- [RGAA 4.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/)
- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)
