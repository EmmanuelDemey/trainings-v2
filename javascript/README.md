# JavaScript

The material of the **JavaScript** training: a slide deck, hands-on workshops,
and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev)
workshops/         one folder per workshop: its README.md and the starter code
solutions/         the worked answers, one folder per workshop, same names
training.config.mjs
```

## Write

```bash
pnpm install
pnpm run list       # what the numbering picks up, and what it leaves out
pnpm run dev        # the deck, live — http://localhost:3030
pnpm run site       # the workshops site, live — http://localhost:4321
```

**The number at the start of a name is its place.** `slides/03_….md` is
chapter 3, `workshops/03_…/` is workshop 3; `10_…` comes after `9_…`. A
name that starts with `_` is turned off — kept on disk, left out of the deck, the
site, the PDFs and the ZIPs. There is no list to maintain anywhere else.

## Build

```bash
pnpm run build          # everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads keep the names of the previous site: `javascript-slides.pdf`,
`javascript-workshops.pdf`, `javascript-solutions.zip`, `javascript-participants.zip`, plus a
starter and a solution ZIP per workshop under `downloads/tp/`.

Each workshop page also opens the workshop in an online editor (StackBlitz,
`playground` in [`training.config.mjs`](training.config.mjs)): no clone, no
install on the learner's machine.

The PDF exports print with Chromium. To use one already on the machine instead
of downloading Playwright's, set `TRAINING_KIT_CHROME` to its path.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml): every push to
`main` that touches this folder deploys it, and a pull request gets
a preview. Nothing to set up in the Netlify UI — the site is created on its first
deploy. [`netlify.toml`](netlify.toml) only carries the headers.

## Optional modules

`fetch`, ES modules and storage are taught on demand. Each is a chapter, a
workshop and a solution, all three turned off by a leading underscore. To teach
one, drop the underscore from the three — see [`workshops/README.md`](workshops/README.md).

## Checking the workshops

```bash
pnpm exec playwright install chromium   # once
pnpm run verify                         # the solutions must pass
pnpm run verify --dir workshops         # the starters must not
```

The CI runs both: [`javascript-workshops.yml`](../.github/workflows/javascript-workshops.yml).
