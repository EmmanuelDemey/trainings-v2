# TP 5 — An environmental budget in the CI

> Write the environmental budget of the ReBoot home page, enforce it in a CI workflow, and catch the regression a new banner brings.

**Duration**: 40 min · **Chapter**: 7 — Continuous monitoring

## Goal

Chapter 7 — The page of workshop 4 is fixed. Since then, the marketing team
added a **promo banner**. The page is still grade **A**: is it fine? A budget
in the CI is what answers that — on every pull request, not once a year.

## Setup

This folder is the solution of workshop 4, plus the promo banner. Serve it:

```bash
cd workshops/05_budget
npx serve .
```

The measure script of the training reads a budget, and fails when the page
goes over it:

```bash
pnpm run measure workshops/05_budget --budget workshops/05_budget/budget.json
```

The places to work on are marked with `TODO workshop 5` comments.

## Steps

1. **Measure** — run `pnpm run measure workshops/05_budget --top 3`. What is
   the grade? What is the size? Which file?
2. **Write the budget** — create `budget.json` in this folder, with at least
   `maxSizeKb` (500 kB at most), `maxRequests` and `maxDom`, and optionally
   `minGrade`. Base the limits on the measures of workshop 4.

   ```json
   { "maxSizeKb": 0, "maxRequests": 0, "maxDom": 0, "minGrade": "A" }
   ```

3. **Run it** — `pnpm run measure … --budget …`. It must **fail**: which limit
   catches the banner? Would the grade alone have caught it?
4. **The CI** — create `.github/workflows/greenit-budget.yml` in this folder: a
   GitHub Actions workflow that runs on **pull requests**, installs the
   dependencies and Chromium, and runs the measure with `--budget budget.json`.
5. **Fix the banner** — the same way as the pictures of workshop 4. The
   pictures you need are already in `images/`: `promo-800.avif`, `promo-1200.webp`… Run the
   budget again: it must pass.

## Deliverable

`budget.json`, `.github/workflows/greenit-budget.yml`, and a page within its budget.

## Checking your work

From the training folder:

```bash
pnpm run verify --dir workshops --tp 05
```

It checks the budget file, the workflow, the page against **your** budget —
and replays the checks of workshop 4, so that the banner does not undo them.

## Going further

- Add the budget of a **second page**, and a matrix in the workflow.
- Store the measure of each run as an **artifact**, and draw the trend.
- Do the same with [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
  and its `budget.json` (`resourceSizes`, `resourceCounts`).

## Useful links

- [GitHub Actions — workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [ecoindex-cli](https://github.com/cnumr/ecoindex_cli)
