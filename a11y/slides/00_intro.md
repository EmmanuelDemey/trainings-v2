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

<!--
Two minutes each, no more. Write down the expectations: come back to them in
the retro (chapter 11). The answers to the question tell you how much to
insist on the screen reader demo in chapter 01.
-->

---

# Objectives of the training

At the end of the two days, you will be able to:

- **Explain** who digital accessibility is for, and what the law requires
  (EAA, RGAA 4.1.2, WCAG 2.2)
- **Navigate** a page with the keyboard and a **screen reader**, the way your
  users do
- **Build** accessible pages with **semantic HTML**: landmarks, headings,
  buttons vs links, tables, forms
- **Use ARIA** only where HTML has no answer — and make a custom widget work
  with the keyboard
- **Build** complex components: a modal dialog, tabs, live regions
- **Audit** a page by hand and with tools (axe, Lighthouse, Playwright), and
  map each issue to its WCAG criterion

<!--
These objectives are the ones of the final questionnaire. EAA: applicable
since 28 June 2025. RGAA 4.1.2 still tests WCAG 2.1 AA; WCAG 2.2 adds 9
criteria — chapter 02 details the gap.
-->

---

# The two days

| | | Chapter | Hands-on |
|---|---|---|---|
| **Day 1** · morning | 9:00 | **00** — Introduction · DOM reminders | — |
| | 9:35 | **01** — Why accessibility · impairments · assistive technologies | 10:10 · Workshop 01 — Screen readers (45 min) |
| | 11:10 | **02** — Standards and legal obligations | 11:45 · Workshop 02 — A manual audit (45 min) |
| **Day 1** · afternoon | 13:45 | **03** — Focus, keyboard and visual design | 14:40 · Workshop 03 — Focus, skip link, reflow (45 min) |
| | 15:40 | **04** — Semantic HTML | 16:35 · Workshop 04 — Semantic HTML (40 min) |
| **Day 2** · morning | 9:05 | **05** — Accessible forms | 9:35 · Workshop 05 — Accessible forms (1 h) |
| | 10:50 | **06** — ARIA | 11:20 · Workshop 06 — A custom ARIA radio group (40 min) |
| | 12:00 | **07** — Complex components | 13:55 · Workshop 07 — A modal dialog (50 min) |
| **Day 2** · afternoon | 14:45 | **08** — Auditing | 15:15 · Workshop 08 — An automated audit (45 min) |
| | 16:10 | **09** — Microdata | 16:20 · Workshop 09 — Microdata (20 min) |
| | 16:40 | **10** — Frameworks and libraries | — |
| | 17:00 | **11** — Conclusion · retro | — |

**Workshop N goes with chapter N.** 9:00 – 17:30 · lunch 12:30 – 13:45 · breaks 10:55 and 15:25 (day 1), 10:35 and 16:00 (day 2) · day 1 ends with 15 min of buffer and questions

<style>
table { font-size: 0.7em; }
td, th { padding-top: 0.2em !important; padding-bottom: 0.2em !important; }
</style>

<!--
Chapters 00 to 02 are mostly theory: keep them short to reach the first
coding workshop (03 — Focus) right after lunch on day 1. Chapter 09 and
workshop 09 are the first to cut if time runs out; chapter 10 is the second.
Microdata comes before frameworks so that the last workshop stays next to its
chapter, and the day ends on the theory that opens onto the learners' own
projects.
-->

---

# Prerequisites

- **HTML and CSS**: you write pages, you know selectors and the box model
- **JavaScript** reading level: `querySelector`, `addEventListener`,
  attributes — chapter 00 is a reminder
- The **browser devtools**: Elements panel, console
- A **laptop** with a recent Chrome or Firefox, **Node.js 22.12+** and **pnpm**
  (for the local server and the verify script)
- A **screen reader** you can run: NVDA (Windows), VoiceOver (macOS), Orca
  (Linux) — workshop 01 installs it
- **Headphones**, if you are in a room with other people

<br />

> No framework: the workshops are **plain HTML, CSS and JavaScript**. What you
> learn applies to React, Vue, Angular or Svelte — chapter 10 shows how.

<!--
Check the setup now, not at workshop 03: `node -v`, `pnpm -v`, and the
screen reader starts. Locked-down corporate laptops often cannot install NVDA:
offer the portable version, or pair people up.
-->

---

# How the training runs — and how it is evaluated

<div style="display: flex; gap: 2em;">
<div>

### Teaching methods

- Short **theory** blocks, always with an example and the *why*
- **Nine hands-on workshops**, one per chapter, same number: about **half
  the time**
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

<!--
Make sure everyone filled in the self-assessment before starting. Half of
the time is hands-on: protect it, cut theory rather than workshops.
-->

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

<!--
Open the app live and try it with the keyboard for 30 seconds: the focus
gets lost quickly, which sets up chapter 03. A late learner can start from
any workshop folder.
-->

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

<!--
Run the commands live once. `playwright install chromium` downloads about
150 MB: have it done during the first break. The verify script is a help,
not the goal — the keyboard and the screen reader come first.
-->

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

<!--
Transition: before the users and the law (chapter 01), chapter 00 is a
short reminder of the DOM, events and `.sr-only` — the tools every
workshop uses.
-->

---

# Reminders — the DOM the workshops need

The workshops are **plain HTML, CSS and JavaScript**. Four tools, and nothing else:

- **Select** elements with CSS selectors, in CSS and in JavaScript
- **Read and write** attributes — the way every ARIA state is toggled
- **Listen** to events, and stop their propagation or default behaviour
- **Hide** content visually while keeping it for screen readers: `.sr-only`

<br />

> Already fluent with the DOM? These slides go fast — 10 minutes.

---

# Selecting elements

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1; min-width: 0;">

```css
/* The same selectors, in CSS… */
#id { }
.className { }
button { }
[aria-hidden='true'] { }
img[aria-hidden='true'] { }
```

</div>
<div style="flex: 1; min-width: 0;">

```js
// …and in JavaScript
const input = document.querySelector('#nameInput');
const submit = document.querySelector('button[aria-label="Submit"]');

// Older API, still fine
const same = document.getElementById('nameInput');
```

</div>
</div>

---

# Selecting several elements

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1; min-width: 0;">

```js
// Several elements: a NodeList
const errors = document.querySelectorAll('[aria-invalid="true"]');

// To an Array, for map / filter / forEach
const buttons = [...document.querySelectorAll('button')];
// or Array.from(document.querySelectorAll('button'))

if (!buttons.length) console.log('No button found');
```

</div>
<div style="flex: 1; min-width: 0;">

```js
// Older APIs: live collections, not NodeLists
document.getElementsByTagName('p');
document.getElementsByClassName('error');
```

</div>
</div>

- An **attribute selector** like `[aria-invalid="true"]` styles and finds
  elements by their **state** — chapter 06 builds on it

---

# Attributes and events

```js
const field = document.querySelector('#email');

field.hasAttribute('aria-invalid');
field.setAttribute('aria-invalid', 'true');   // ARIA states are plain attributes
field.removeAttribute('aria-invalid');
```

```js
document.addEventListener('DOMContentLoaded', () => {   // the HTML is parsed
  const button = document.querySelector('button');

  button.addEventListener('click', (e) => {
    e.stopPropagation();   // stop the bubbling to the parents
    e.preventDefault();    // cancel the default action (submit, navigate…)
    console.log('Button clicked:', button.textContent);
  });
});
```

- By default an event **bubbles**: it is dispatched on the target, then on each
  of its ancestors
- `keydown` + `e.key` is what custom widgets listen to (chapters 06 and 07)

---

# `.sr-only` — visible to screen readers only

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1; min-width: 0;">

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);     /* deprecated, kept for old browsers */
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}
```

</div>
<div style="flex: 1; min-width: 0;">

| Technique | Seen | Read out |
|---|---|---|
| `display: none` | ❌ | ❌ |
| `visibility: hidden` | ❌ | ❌ |
| `opacity: 0` | ❌ | ✅ — but still clickable and focusable: confusing |
| **`.sr-only`** | ❌ | ✅ |

</div>
</div>

<style>
table { font-size: 0.8em; }
</style>

---

# `.sr-only` — when to use it

```html
<!-- Skip link (needs a :focus style to show up, chapter 03) -->
<a href="#main-content" class="sr-only">Skip to main content</a>

<!-- Icon button -->
<button>
  <span class="sr-only">Close</span>
  <svg aria-hidden="true"><!-- X --></svg>
</button>

<!-- Extra context -->
<a href="https://example.com" target="_blank">
  Documentation
  <span class="sr-only">(opens in a new tab)</span>
</a>
```

- For what is **visually obvious** but not spoken: skip links, icon labels,
  instructions for a complex widget, "opens in a new tab"

---

# And in a framework?

- Selecting, listening, toggling attributes: the **same concepts** in React,
  Vue, Angular, Svelte — through refs, bindings and directives
- They add their own APIs for **focus** and **ARIA attributes**: chapter 10
- What you learn here on plain HTML applies there unchanged — the browser and
  the screen reader only ever see the **DOM**

<br />

> Next — chapter 01: **who** these tools are for, and how a screen reader
> turns the DOM into speech.
