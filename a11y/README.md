# Digital Accessibility

The material of the **Digital Accessibility** training: a slide deck, hands-on
workshops, and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev), images in slides/public/
workshops/         one folder per workshop: its README.md and the starter code
solutions/         the worked answers, one folder per workshop, same names
scripts/verify.mjs the functional check of the workshops (Playwright + axe-core)
training.config.mjs
```

## Write

```bash
pnpm install
pnpm run list       # what the numbering picks up, and what it leaves out
pnpm run dev        # the deck, live — http://localhost:3030
pnpm run site       # the workshops site, live — http://localhost:4321
pnpm run check      # missing READMEs, broken links and images
```

**The number at the start of a name is its place.** `slides/03_….md` is
chapter 3, `workshops/03_…/` is workshop 3; `10_…` comes after `9_…`. A
name that starts with `_` is turned off — kept on disk, left out of the deck, the
site, the PDFs and the ZIPs. There is no list to maintain anywhere else.

## The workshops

The learners build **Genea11y**, a small family-tree app in plain HTML, CSS and
JavaScript — no build step, no dependency. Each workshop folder is
**autonomous**: it holds the whole app as it stands at the end of the previous
workshop, with `TODO workshop N` comments where to work. A late learner starts
from any folder.

Workshops 1 (a screen reader) and 2 (a manual audit) have no code: their
`solutions/` folder holds the expected outcome. Workshop 8's starter carries a
few defects on purpose, for the learners to find with Lighthouse and axe —
diff `workshops/08_automated_audit/` against its solution to see which.

## Check the workshops

```bash
pnpm exec playwright install chromium   # once
pnpm run verify                         # the solutions: every check passes
pnpm run verify --dir workshops         # the starters: they must fail
pnpm run verify --tp 05                 # one workshop
```

[`scripts/verify.mjs`](scripts/verify.mjs) serves each folder over http:// and
drives it in Chromium the way a keyboard or screen reader user would: it
finds elements by **role and accessible name**, presses Tab, Space, the arrow
keys and Escape, and runs **axe-core**. Each workshop also replays the checks of
the workshops before it, so a later step cannot break an earlier one. To use a
Chromium already on the machine, set `PW_CHROME` to its path.

The CI runs both commands before each deploy
([`workshops.ci.mjs`](workshops.ci.mjs)): the solutions must pass, and the
starters must fail — a starter that passes means an answer leaked into it.

## Build

```bash
pnpm run build          # everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads are `a11y-slides.pdf`, `a11y-workshops.pdf`, `a11y-solutions.zip`,
`a11y-participants.zip`, plus a starter and a solution ZIP per workshop under
`downloads/tp/`. Each workshop page also opens the workshop in an online editor
(StackBlitz, `playground` in [`training.config.mjs`](training.config.mjs)).

The PDF exports print with Chromium. To use one already on the machine instead
of downloading Playwright's, set `TRAINING_KIT_CHROME` to its path.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml): every push to
`main` that touches this folder deploys it, and a pull request gets
a preview. Nothing to set up in the Netlify UI — the site is created on its first
deploy. [`netlify.toml`](netlify.toml) only carries the headers.
