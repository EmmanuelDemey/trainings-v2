# Green IT workshops — ReBoot

Six workshops, one day. The first three need no code: you estimate a footprint,
assess a service against the RGESN, and question AI features. Workshops 4 and 5
are hands-on on **ReBoot**, a small shop of refurbished phones: a home page that
looks fine and weighs 10 MB. The last one is your own roadmap.

Everything is **plain HTML, CSS and JavaScript**: no framework, no build step.

## The workshops

| # | Folder | Chapter | Code? |
|---|--------|---------|-------|
| 1 | `01_footprint` | 1 - The environmental impacts of digital | no |
| 2 | `02_rgesn_assessment` | 2 - RGESN and the REEN law | no |
| 3 | `03_frugal_ai` | 4 - Frugal AI | no |
| 4 | `04_frugal_page` | 6 - Running an audit | yes |
| 5 | `05_budget` | 7 - Continuous monitoring | yes |
| 6 | `06_roadmap` | 8 - How to convince | no |

Chapters 3 (The 115 good practices and the INR framework), 5 (The tools) and 9
(Conclusion) have no workshop of their own: workshop 4 uses both.

## How to run a workshop

The pages are best served over a real `http://` origin. From inside the
workshop folder, pick whichever you have:

```bash
cd workshops/04_frugal_page

# Node.js (recommended)
npx serve .

# Python
python -m http.server 3000
```

Then open the printed address in Chrome or Edge, the devtools open on the
**Network** panel, **Disable cache** ticked.

## Measuring a page

From the training folder (the one that contains `workshops/`):

```bash
pnpm install
pnpm exec playwright install chromium        # once

pnpm run measure workshops/04_frugal_page --top 5
pnpm run measure workshops/05_budget --budget workshops/05_budget/budget.json
```

It opens the page in Chromium, the cache disabled, scrolls to the bottom, waits,
and prints its **EcoIndex** — the same algorithm as ecoindex.fr — its DOM, its
requests, its size, and the requests sent while the page was left alone.

## Knowing when you are done

For workshops 4 and 5:

```bash
pnpm run verify --dir workshops --tp 04      # one workshop
pnpm run verify --dir workshops              # all of them
```

Each line is a criterion: `OK`, or `KO -> what was found instead`. On a starter,
most lines are `KO`, and that is the to-do list. Workshop 5 also replays the
checks of workshop 4.

## Solutions

Every workshop has a worked answer in `solutions/<folder>/`. `pnpm run verify`
with no `--dir` runs the checks on the solutions, and every one of them passes.
Do not open a solution before you have tried the workshop yourself.
