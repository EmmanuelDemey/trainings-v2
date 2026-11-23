# TP 4 — Audit and fix a web page

> Measure the home page of the ReBoot shop, find where its weight comes from, and bring it from grade E to grade A without losing a feature.

**Duration**: 1 h 15 (20 min of audit, 50 min of fixes, 5 min to measure) · **Chapter**: 6 — Running an audit

## Goal

Chapters 5 and 6 — **ReBoot** sells refurbished phones. Its home page looks
fine, and weighs **10 MB**: a minute to load on 3G, and a page that needs a
recent phone. Audit it with the tools, then fix it. Every feature must still
work: the catalogue, the prices, the stock, the reviews.

Not a developer? Do the audit (steps 1 and 2) and write the report; pair with a
developer for the fixes.

## Setup

```bash
cd workshops/04_frugal_page
npx serve .
```

Open the page in Chrome or Edge, with the devtools open on the **Network**
panel, **Disable cache** ticked. No local clone? Download the starter ZIP of
this page: the online editor leaves the pictures out, so its weights are wrong.

The places to work on are marked with `TODO workshop 4` comments, in
`index.html` and `script.js`. The optimised pictures are already made for you, next
to the PNGs in `images/`: `<name>-240.avif`, `<name>-480.webp`, `hero-800.avif`,
`hero-1200.webp`… — use them, or make your own (see *Going further*).

## Steps

### 1. Measure

From the training folder (the one that contains `workshops/`):

```bash
pnpm install
pnpm exec playwright install chromium        # once
pnpm run measure workshops/04_frugal_page --top 5
```

Note the **baseline**: EcoIndex, grade, DOM, requests, size. In the browser,
check the same in the Network panel, and run **Lighthouse** (Performance).

### 2. Audit

Find, with the tools, **why** it weighs this much. Write one line per finding:
what, where, how many kB / requests / elements, and the practice it breaks.
Leave the page alone a minute in the Network panel: what happens?

### 3. Fix

Fix what you found, the biggest first. For each fix, measure again. The
`TODO` comments point at five problems — there may be more:

- the **banner**;
- the **product photos**;
- a **library** of 200 kB;
- the **stock**;
- the **reviews**.

Prices must still read `329,00 €`, and the 6 phones, their names, the stock
and the reviews must still be there.

## Deliverable

The page, fixed, and an audit report:

| # | Finding | Where | Before | Fix | After |
|---|---|---|---|---|---|
| 1 | | | | | |

## Checking your work

From the training folder:

```bash
pnpm run verify --dir workshops --tp 04
```

Each line is a criterion: `OK`, or `KO -> what was found instead`. On the
starter, most lines are `KO`: that is the to-do list. You are done when every
line is `OK` — among them: EcoIndex grade **A**, under **300 kB**, at most 15
requests, under 400 DOM elements, no file over 50 kB, nothing fetched while the
page is left alone.

## Going further

- Make the pictures yourself, with [Squoosh](https://squoosh.app/) or
  `npx sharp-cli`: which format and quality do you choose, and why?
- Throttle the network to **Slow 4G** in the devtools, and compare the load
  time before and after.
- Install the **GreenIT-Analysis** extension: which of its recommendations
  did you miss?

## Useful links

- [MDN — responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
- [MDN — lazy loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading)
- [MDN — Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [115 good practices — CNumR](https://github.com/cnumr/best-practices)
- [EcoIndex — how it works](https://www.ecoindex.fr/comment-ca-marche/)
