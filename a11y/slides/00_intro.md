---
layout: cover
---

# 00 - Introduction

---

# Round table

<div style="display: flex; gap: 2em;">
<div>

### Tell us

- **Who** you are, your **role** in the team
- Your **experience** with accessibility: none, a few fixes, an audit, a
  design system…
- What you **expect** from these two days

</div>
<div>

### And one question

- Have you ever **used** a site with the keyboard only, or with a screen
  reader?
- If yes: what was the **first** thing that went wrong?

</div>
</div>

---

# Objectives of the training

At the end of the two days, you will be able to:

- **Explain** who digital accessibility is for, and what the law requires
  (EAA, RGAA 4.1, WCAG 2.2)
- **Navigate** a page with the keyboard and a **screen reader**, the way your
  users do
- **Build** accessible pages with **semantic HTML**: landmarks, headings,
  buttons vs links, tables, forms
- **Use ARIA** only where HTML has no answer — and make a custom widget work
  with the keyboard
- **Build** complex components: a modal dialog, tabs, live regions
- **Audit** a page by hand and with tools (axe, Lighthouse, Playwright), and
  map each issue to its WCAG criterion

---

# The two days

| | Chapter | Hands-on |
|---|---|---|
| **Day 1** · morning | **01** — Reminders (DOM, events, `.sr-only`) | — |
| | **02** — Why accessibility · impairments · assistive technologies | Workshop 01 — Screen readers |
| | **03** — Standards and legal obligations | Workshop 02 — A manual audit |
| **Day 1** · afternoon | **04** — Focus and keyboard | Workshop 03 — Focus and skip link |
| | **05** — Semantic HTML | Workshop 04 — Semantic HTML |
| **Day 2** · morning | **06** — Accessible forms | Workshop 05 — Accessible forms |
| | **07** — ARIA | Workshop 06 — A custom ARIA radio group |
| | **08** — Complex components | Workshop 07 — A modal dialog |
| **Day 2** · afternoon | **09** — Auditing | Workshop 08 — An automated audit |
| | **10** — Frameworks and libraries | — |
| | **11** — Microdata | Workshop 09 — Microdata |
| | **12** — Conclusion · retro | — |

<style>
table { font-size: 0.75em; }
td, th { padding-top: 0.2em !important; padding-bottom: 0.2em !important; }
</style>

---

# Prerequisites

- **HTML and CSS**: you write pages, you know selectors and the box model
- **JavaScript** reading level: `querySelector`, `addEventListener`,
  attributes — chapter 01 is a reminder
- The **browser devtools**: Elements panel, console
- A **laptop** with a recent Chrome or Firefox, **Node.js 22** and **pnpm**
  (for the local server and the verify script)
- A **screen reader** you can run: NVDA (Windows), VoiceOver (macOS), Orca
  (Linux) — workshop 01 installs it
- **Headphones**, if you are in a room with other people

<br />

> No framework: the workshops are **plain HTML, CSS and JavaScript**. What you
> learn applies to React, Vue, Angular or Svelte — chapter 10 shows how.

---

# How the training runs — and how it is evaluated

<div style="display: flex; gap: 2em;">
<div>

### Teaching methods

- Short **theory** blocks, always with an example and the *why*
- **Nine hands-on workshops**: about **half the time**
- **Live demos** with a screen reader and the accessibility tree open
- Field experience from the trainer: what fails in real audits
- Digital course materials: slides, workshops, solutions

</div>
<div>

### Evaluation

- **Before** — a self-assessment questionnaire, to calibrate the session
- **During** — the workshops: the verify script goes from **KO to OK**
- **After** — a **final questionnaire** mirroring the self-assessment, to
  measure the progress

</div>
</div>

---

# The workshops — one app, two days

**Genea11y** (*Genealogy* + *a11y*): a small app that manages a family tree.

<div style="display: flex; gap: 2em;">
<div>

### Two pages

- `index.html` — the **list** of people, a table, the details of a person
- `create.html` — the **"Add a person"** form
- `style.css`, `script.js` — no framework, no build step

</div>
<div>

### One journey

- It **looks fine**, and fails most of its keyboard and screen reader users
- Each workshop fixes **one chapter's** worth of problems
- **Each folder is self-contained**: it starts where the previous one ends,
  so a missed workshop never blocks you

</div>
</div>

<br />

> The places to work on are marked with `TODO workshop N` comments.

---

# How a workshop works

```bash
cd workshops/03_focus
npx serve .                                   # the app, on http://localhost:3000

# From the training folder (the one that contains workshops/)
pnpm install
pnpm exec playwright install chromium         # once
pnpm run verify --dir workshops --tp 03       # one workshop
```

<div style="display: flex; gap: 2em;">
<div>

### By hand, first

- Stop touching the mouse: **Tab**, **Shift+Tab**, **Enter**, **Space**,
  the arrows
- Then again with the **screen reader** on
- That is how your users meet the page — no tool replaces it

</div>
<div>

### Then the verify script

- A real Chromium finds elements by **role and accessible name**, never by
  a CSS class — like a screen reader
- Each line: `OK`, or `KO -> what was found instead`
- From workshop 08 on, it also runs **axe-core**
- It **replays** the checks of the earlier workshops

</div>
</div>

<style>
.slidev-code { --slidev-code-font-size: 11px; --slidev-code-line-height: 16px; }
</style>

---

# Definition of done

A workshop is done when:

1. You went through the page **with the keyboard only** — every action
   reachable, the focus always visible
2. You listened to it **with the screen reader** — every element announced
   with the right role and name
3. `pnpm run verify --dir workshops --tp NN` prints **only `OK`** (workshops
   03 to 09)
4. You can **explain** each change to your neighbour, and name the **WCAG
   criterion** it fixes

<br />

- `solutions/NN_*` holds the worked answer: compare **after** trying
- Stuck for more than 5 minutes? **Ask.** Then peek at the solution — one
  file, not the whole folder
- Workshops **01** and **02** have no code: you install a screen reader, then
  audit a page by hand
