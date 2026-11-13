# TP 1 — Screen readers: what you should have noticed

> The expected outcome of workshop 1: no code, only what a few minutes behind a screen reader teaches.

There is no single right answer: it depends on the sites you browsed. Here is
what most people notice the first time, and what it says about how pages are
built.

## The screen reader is set up

- NVDA, VoiceOver or Orca starts and stops, and you can silence it with
  **Ctrl** at any time.
- You switched at least once between **browse mode** (single-letter shortcuts:
  H, K, F…) and **focus / forms mode** (the keys type into the field). This is
  the reason why typing *"h"* in a field sometimes jumps to a heading instead.

## What a page sounds like

- **Headings are the table of contents.** Users list them first to get an
  overview of the page, then jump to the one they want. A page with no heading,
  or with headings chosen for their size and not their level, is a wall of text.
- **Landmarks are the shortcuts.** *banner*, *navigation*, *main*,
  *contentinfo* come from `<header>`, `<nav>`, `<main>`, `<footer>`. A page
  built from `<div>`s has none.
- **Links are often read out of context**, in a list. *"Read more"* ten times
  over tells nothing; *"Read more about the 2026 budget"* does.
- **Images** are announced by their `alt`. Without one, the screen reader reads
  the file name (*"IMG_2034 dot jpg"*), or skips it. A decorative image should
  have `alt=""` so it is skipped on purpose.
- **Icon-only buttons** (a ✕, a hamburger, a magnifying glass) are often
  announced as *"button"*, with no name at all.
- **Tables** are read cell by cell with their headers (*"Last name, column 1,
  Dupont"*) only when they are real `<table>`s with `<th>`. A grid of `<div>`s
  is read as a flat list of words.

## What a form sounds like

- A field without a `<label>` is announced as *"edit text"*: you do not know
  what to type. The `placeholder` is not a reliable replacement: it is not always
  read, and it disappears as soon as you type.
- *"Required"* is announced only if the field has `required` (or
  `aria-required`). A red asterisk alone is invisible.
- An error shown in red under the field is **not announced** unless it is tied
  to the field (`aria-describedby`) or put in a live region (`role="alert"`).
  With your eyes closed, the form simply *"does nothing"* when you submit it.
- Groups of radios or checkboxes without a `<fieldset>` and `<legend>` are read
  as *"Yes, radio button, No, radio button"*: yes to what?

## The lessons for the next workshops

1. The keyboard comes first: if Tab cannot reach it, the screen reader user
   cannot use it either. That is workshop 3.
2. Most of the problems are fixed by **the right HTML element**, not by ARIA.
   That is workshops 4 and 5.
3. A screen reader takes much longer than the eyes to scan a page: every useless
   tab stop, every unnamed button, every missing heading is paid for again and
   again.
