# JavaScript workshops — 12 autonomous TPs (+ 3 optional)

One folder per workshop. **Each folder is self-contained**: no `npm install`, no
build step, no dependency on the other workshops. Open the folder and start.

| # | Folder | Chapter | Day |
|---|--------|---------|-----|
| 1 | `01_introduction` | 1 - Introduction | 1 |
| 2 | `02_mental_model` | 2 - Mental model | 1 |
| 3 | `03_syntax` | 3 - JS syntax | 1 |
| 4 | `04_classes` | 4 - Classes | 1 |
| 5 | `05_window` | 5 - The window | 2 |
| 6 | `06_dom` | 6 - The DOM | 2 |
| 7 | `07_events` | 7 - Event-driven programming | 2 |
| 8 | `08_responsive` | 8 - JavaScript and responsive design | 2 |
| 9 | `09_countdown` | 9 - Guided practice, mini-project 1 | 3 |
| 10 | `10_password_generator` | 9 - Guided practice, mini-project 2 | 3 |
| 11 | `11_staff_directory` | 9 - Guided practice, mini-project 3 | 3 |
| 12 | `12_social_network` | 9 - Guided practice, mini-project 4 | 3 |

## Optional modules

Three extra chapters exist, **off by default**. They are not part of the three
days: they are turned on for a group that asks for them, and they each come with
their own workshop.

| # | Folder | Chapter |
|---|--------|---------|
| 13 | `13_fetch` | 10 - Talking to a server |
| 14 | `14_es_modules` | 11 - ES Modules |
| 15 | `15_storage` | 12 - Local & Session Storage |

While a module is off, its folder is prefixed with an underscore
(`_13_fetch`) — which keeps it out of the slides, out of this site and out of
the printed handbook. Switch one on from `training/`:

```bash
pnpm run modules              # what exists, and what is on
pnpm run modules fetch on
pnpm run modules storage off
pnpm run modules all on
```

**These three need a real `http://` origin** — `fetch`, ES modules and
`localStorage` are all refused on `file://`:

```bash
npx serve chapters/javascript/tp/13_fetch
```

## How to run a workshop

Double-click `index.html` — that is all. Everything runs from `file://`, there
is no module and no server involved.

If you prefer a real `http://` origin (recommended from workshop 6 onwards, and
required if you later add `fetch` or ES modules):

```bash
npx serve chapters/javascript/tp/06_dom
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

**In the page.** Workshops 2, 3, 4, 5, 6, 8 and 11 ship a `check.js` that runs on
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
pnpm exec playwright install chromium                        # once

pnpm run verify:javascript --dir chapters/javascript/tp           # every workshop
pnpm run verify:javascript --dir chapters/javascript/tp --tp 08   # just one
```

It drives a real browser: it clicks *Start* twice on your countdown, generates
20 passwords to check that every ticked class is really present, and posts an
`<img src=x onerror=...>` in your feed to check that it is displayed and not
executed.

## Solutions

Every workshop has a complete worked answer in `solutions/javascript/<folder>/`.
Do not open it before you have made the workshop fail at least once.
