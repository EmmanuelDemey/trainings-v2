# OpenSearch

The material of the **OpenSearch** training — a 2-day program delivered in 1 day,
in French: a slide deck, hands-on workshops, and the site that publishes them —
built by [training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev)
  shared/          the end-of-day retro, imported by the last chapter
ci/Dockerfile      the OpenSearch the CI replays every request against
ci/fixtures/       the data some chapters need, replayed before them in the CI
workshops/         one folder per workshop, its README.md: setup, goals, hints
  01_installation/docker-compose.yml   the learners' lab: OpenSearch + Dashboards
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

## The day

The [official program](https://www.sparks-formation.com/formation/opensearch-maitriser-le-moteur-de-recherche-open-source/)
runs over two days; this deck covers all of it in one, with short workshops
(20–45 min) and a « Pour aller plus loin » section in each README for what the
day leaves out.

| | Chapters | Workshops |
|---|---|---|
| Morning | 0 → 5 — OpenSearch, architecture, installation, mapping, search | 1 · 2 · 3 |
| Afternoon | 6 → 11 — analysis, aggregations, advanced search, ingest, Dashboards | 4 · 5 · 6 · 7 · 8 |

To give it over two days, keep the same chapters and do the « Pour aller plus
loin » sections in the session.

## Build

```bash
pnpm run build          # everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
pnpm dlx serve build    # serve it as Netlify will
```

The downloads: `opensearch-slides.pdf`, `opensearch-workshops.pdf`,
`opensearch-participants.zip`, plus a starter ZIP per workshop under
`downloads/tp/`.

The learners write the requests themselves: each README holds the setup (index
and data), then per step a goal, a folded hint and the response to expect. The
requests are in `solutions/<workshop>/SOLUTION.md`, for the trainer — out of the
site, the PDFs and the ZIPs (`solutions: false`). No online editor.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml): every push to
`main` that touches this folder deploys it, and a pull request gets
a preview. Nothing to set up in the Netlify UI — the site is created on its first
deploy. [`netlify.toml`](netlify.toml) only carries the headers.

## Tested against OpenSearch

Before each deploy, the CI replays **every request** of the workshops and of the
slides against a real OpenSearch — the one of [`ci/Dockerfile`](ci/Dockerfile),
the only place its version is written, security plugin off as in the lab
([`check-console.mjs`](../scripts/check-console.mjs): OpenSearch speaks the REST
API of Elasticsearch 7.10, the script needs no change). A request that fails, or
a response that does not hold the « Résultat attendu » JSON that follows it, holds
back the deploy. Workshop 8 is done in the Dashboards UI: nothing to replay.

```bash
docker build -t training-os ci && docker run -d --rm --name training-os -p 9200:9200 training-os
node ../scripts/check-console.mjs .              # everything
node ../scripts/check-console.mjs . 07_ingest    # one file
```

Bump the version in `ci/Dockerfile` **and** in `workshops/01_installation/docker-compose.yml`
(and the image tags in `slides/03_installation.md`).
