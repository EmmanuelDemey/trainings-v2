# TP 5 — An environmental budget in the CI: the solution

> A budget that catches the 2 MB promo banner the grade missed, a CI workflow that enforces it, and the banner fixed.

## The measure of the starter

```text
  EcoIndex     80.3 / 100   grade A
  DOM          84 elements
  Requests     13
  Size         2331 kB
```

Still grade **A**, with 2.3 MB: the EcoIndex weighs the size **once**, the DOM
**three times**. A page that gains a heavy picture barely moves. Only a
**size** limit catches it.

## `budget.json`

```json
{
  "maxDom": 400,
  "maxRequests": 20,
  "maxSizeKb": 300,
  "minGrade": "A"
}
```

On the starter:

```text
  Budget workshops/05_budget/budget.json
    OK  DOM 84 elements ≤ 400
    OK  requests 13 ≤ 20
    KO  size 2331 kB ≤ 300 kB  (+2031 kB)
    OK  EcoIndex A (80.3) at least A
```

## `.github/workflows/greenit-budget.yml`

See the file in this folder: on every pull request, it installs the
dependencies and Chromium, and runs

```bash
pnpm run measure workshops/05_budget --budget workshops/05_budget/budget.json
```

In a real project, the workflow lives at the root of the repository, and
measures the pages of the deployed preview or of a local build.

## The banner

A `<picture>` with AVIF and WebP at 800 and 1200 px, `width` and `height`,
`loading="lazy"` — it is below the fold. 2,313 kB → ≈ 3 kB. The page passes its
budget:

```text
  EcoIndex     90.6 / 100   grade A
  Size         20.8 kB
    OK  size 21 kB ≤ 300 kB
```
