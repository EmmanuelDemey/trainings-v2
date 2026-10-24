# Elasticsearch

The material of the **Elasticsearch** training (3 days): a slide deck, hands-on
workshops, and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev)
  public/images/   the images of the deck, referenced as /images/…
ci/fixtures/       the data some chapters need, replayed before them in the CI
workshops/         one folder per workshop, its README.md: setup, goals, hints
solutions/         one SOLUTION.md per workshop — never published
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

## What is shared with elastic-security

The Elastic Stack overview, the Kibana tour, Elastic Agent and Fleet, and the
images they show live once in [`../elasticsearch-common`](../elasticsearch-common):
the chapters import them with Slidev's `src:`, and `pnpm run sync` (run by
`postinstall`, `dev` and `build`) copies the images to `slides/public/images/common/`
(gitignored).

## Build

```bash
pnpm run build          # everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads: `elasticsearch-slides.pdf`, `elasticsearch-workshops.pdf`,
`elasticsearch-participants.zip`, plus a starter ZIP per workshop under
`downloads/tp/`.

The learners write the requests themselves: each README holds the setup (index
and data), then per step a goal, a folded hint and the response to expect. The
requests are in `solutions/<workshop>/SOLUTION.md`, for the trainer — out of the
site, the PDFs and the ZIPs (`solutions: false`). No online editor.

The PDF exports print with Chromium. To use one already on the machine instead
of downloading Playwright's, set `TRAINING_KIT_CHROME` to its path.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml): every push to
`main` that touches this folder deploys it, and a pull request gets
a preview. Nothing to set up in the Netlify UI — the site is created on its first
deploy. [`netlify.toml`](netlify.toml) only carries the headers.

## Tested against Elasticsearch

Before each deploy, the CI replays **every request** of the workshops and of the
slides against a real Elasticsearch — the one of [`../elasticsearch-common/ci/Dockerfile`](../elasticsearch-common/ci/Dockerfile),
the only place its version is written, shared with `elastic-security`
([`check-console.mjs`](../scripts/check-console.mjs)). A request that fails, or a
response that does not hold the « Expected result » JSON that follows it, holds
back the deploy. A workshop's `SOLUTION.md` is replayed right after its README, on
the data the setup created: the solutions are proven to give the expected results.

```bash
docker build -t training-es ../elasticsearch-common/ci && docker run -d --rm --name training-es -p 9200:9200 training-es
export ES_PASSWORD=training
node ../scripts/check-console.mjs .            # everything
node ../scripts/check-console.mjs . 10_ilm     # one file
```

- A comment before a block tunes its check: `<!-- ci: skip -->` (several nodes, a
  restart, a placeholder…), `<!-- ci: expect-error -->`, `<!-- ci: retry -->`
  (what settles in the background), `<!-- ci: no-compare -->`, and
  `<!-- ci: skip-start -->` … `<!-- ci: skip-end -->`.
- A chapter whose examples need data has a fixture,
  `ci/fixtures/<chapter without its number>.md`, replayed before it.
- Each file runs on its own, on a wiped cluster.

Staying on the latest release: Dependabot ([`dependabot.yml`](../.github/dependabot.yml))
opens a pull request for each new Elasticsearch image, whose CI replays everything
on it; and every Monday, [`elasticsearch-latest.yml`](../.github/workflows/elasticsearch-latest.yml)
replays everything on the latest release, whatever the pin.
