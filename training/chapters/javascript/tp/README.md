# JavaScript workshops — 11 autonomous TPs

One folder per workshop. **Each folder is self-contained**: no `npm install`, no
build step, no dependency on the other workshops. Open the folder and start.

| # | Folder | Chapter | Day | Roughly |
|---|--------|---------|-----|---------|
| 1 | `01_introduction` | 1 - Introduction | 1 | 30 min |
| 2 | `02_mental_model` | 2 - Mental model | 1 | 45 min |
| 3 | `03_syntax` | 3 - JS syntax | 1 | 1h45 |
| 4 | `04_window` | 4 - The window | 2 | 45 min |
| 5 | `05_dom` | 5 - The DOM | 2 | 1h |
| 6 | `06_events` | 6 - Event-driven programming | 2 | 1h15 |
| 7 | `07_responsive` | 7 - JavaScript and responsive design | 2 | 45 min |
| 8 | `08_countdown` | 8 - Guided practice, mini-project 1 | 3 | 1h |
| 9 | `09_password_generator` | 8 - Guided practice, mini-project 2 | 3 | 1h15 |
| 10 | `10_staff_directory` | 8 - Guided practice, mini-project 3 | 3 | 1h15 |
| 11 | `11_social_network` | 8 - Guided practice, mini-project 4 | 3 | 1h30 |

## How to run a workshop

Double-click `index.html` — that is all. Everything runs from `file://`, there
is no module and no server involved.

If you prefer a real `http://` origin (recommended from workshop 5 onwards, and
required if you later add `fetch` or ES modules):

```bash
npx serve chapters/javascript/tp/05_dom
# then open the printed http://localhost:3000
```

**Keep the console open (F12) at all times.** Every workshop logs there, and
every mistake you make will show up there first.

## How a workshop is written

- `README.md` — the goal, the steps, and the "going further" list.
- `index.html` — the markup, already written. You rarely need to touch it.
- `style.css` — the styles, already written. The classes the JS must toggle
  (`hidden`, `active`, `error`...) are defined here.
- `app.js` — **your file**. It contains `// TODO` markers, one per step.

## Knowing when you are done

**In the page.** Workshops 2, 3, 4, 5, 7 and 10 ship a `check.js` that runs on
load and prints one line per acceptance criterion in the console:

```
❌ the 4 products are rendered
✅ the title was changed
2/7 checks passing
```

All red at the start is normal — that *is* the to-do list. Nothing to install.

**From the terminal**, for the interactive parts a page cannot check by itself
(clicks, form submissions, resizes). The same suite that validates the official
solutions can be pointed at **your** work:

```bash
npx playwright install chromium                              # once

npm run verify:javascript -- --dir chapters/javascript/tp    # all 11
npm run verify:javascript -- --dir chapters/javascript/tp --tp 08   # just one
```

It drives a real browser: it clicks *Start* twice on your countdown, generates
20 passwords to check that every ticked class is really present, and posts an
`<img src=x onerror=...>` in your feed to check that it is displayed and not
executed.

## Solutions

Every workshop has a complete worked answer in `solutions/javascript/<folder>/`.
Do not open it before you have made the workshop fail at least once.
