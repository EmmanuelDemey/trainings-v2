# Accessibility workshops — Genea11y

For the whole training you will work on **Genea11y** (Genealogy + a11y), a small
app that manages a family tree: a page that lists people (`index.html`) and a
page that adds one (`create.html`). You will start with a page that looks fine
and fails most of its keyboard and screen reader users, and make it accessible
one chapter at a time.

Everything is **plain HTML, CSS and JavaScript**: no framework, no
`npm install`, no build step. What you learn here applies to any framework
afterwards; chapter 10 shows how.

## The workshops

**Each folder is self-contained.** It holds the full app (`index.html`,
`create.html`, `style.css`, `script.js`) as it stands at the end of the
previous workshop, so you can start any workshop even if you skipped or broke
the one before. The places to work on are marked with `TODO workshop N`
comments.

| # | Folder | Chapter |
|---|--------|---------|
| 1 | `01_screen_reader` | 2 - Introduction to accessibility |
| 2 | `02_manual_audit` | 3 - Legal obligations |
| 3 | `03_focus` | 4 - Focus |
| 4 | `04_semantic_html` | 5 - Semantic HTML |
| 5 | `05_forms` | 6 - Forms |
| 6 | `06_aria_radio` | 7 - ARIA |
| 7 | `07_modal` | 8 - Complex components |
| 8 | `08_automated_audit` | 9 - Auditing |
| 9 | `09_microdata` | 11 - Microdata |

Chapters 1 (Reminders), 10 (Frameworks) and 12 (Conclusion) have no workshop.
Workshops 1 and 2 have no code: you install a screen reader, then audit a page
by hand.

## How to run a workshop

The pages are best served over a real `http://` origin. From inside the
workshop folder, pick whichever you have:

```bash
cd workshops/03_focus

# Node.js (recommended)
npx serve .

# Python
python -m http.server 3000

# PHP
php -S localhost:3000
```

Then open the printed address (http://localhost:3000 with Python or PHP) in
your browser.

## Knowing when you are done

**By hand, first.** Unplug the mouse — or just stop touching it — and go
through the page with **Tab**, **Shift+Tab**, **Enter**, **Space** and the
arrows. Then do it again with your screen reader on (workshop 1). That is how
your users meet the page, and no tool replaces it.

**From the terminal**, for workshops 3 to 9. A script drives each workshop folder
in a real Chromium, the way a keyboard or screen reader user would: it finds
elements by their **role and accessible name**, never by a CSS class. It
presses Tab, submits the form empty, opens the dialog, and, from workshop 8 on,
runs **axe-core**, the engine behind Lighthouse and axe DevTools. From the
training folder (the one that contains `workshops/`):

```bash
pnpm install
pnpm exec playwright install chromium        # once

pnpm run verify --dir workshops --tp 05      # one workshop
pnpm run verify --dir workshops              # all of them
```

Each line is a criterion: `OK`, or `KO -> what was found instead`. On a starter,
most lines are `KO`, and that is the to-do list. Each workshop also replays the
checks of the workshops before it, so you know you did not break what was done
earlier.

## Solutions

Every workshop has a worked answer in `solutions/<folder>/`. `pnpm run verify`
with no `--dir` runs the checks on the solutions, and every one of them passes.
Do not open a solution before you have tried the workshop yourself.
