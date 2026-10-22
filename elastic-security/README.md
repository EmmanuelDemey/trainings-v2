# Elastic Security for SIEM

The material of the **Elastic Security for SIEM** training (3 days, following
Elastic's [course outline](https://www.elastic.co/training/elastic-security-for-siem)):
a slide deck, hands-on workshops, and the site that publishes them — built by
[training-kit](https://www.npmjs.com/package/@emmanueldemey/training-kit).

```
slides/            one Markdown file per chapter (Slidev)
workshops/         one folder per workshop, its README.md (in French)
  01_lab_fleet/    the lab: docker-compose.yml + kibana.yml (Elasticsearch, Kibana, Fleet Server)
ci/fixtures/       the lab dataset, replayed before the chapters that query it
training.config.mjs
```

| Day | Chapters |
|-----|----------|
| 1 | Introduction · Stack overview, Fleet and Elastic Agent · Elastic Common Schema · Discover |
| 2 | Visualizations · Dashboards · The Security app · Detection rules |
| 3 | Alerts, Timeline and Cases · Threat hunting capstone · Summary |

## What is shared with elasticsearch

The Elastic Stack overview, the Kibana presentation, Elastic Agent and Fleet, and
the ES|QL anatomy are written once, in [`../elasticsearch-common`](../elasticsearch-common):
the chapters import them with Slidev's `src:`. `pnpm run sync` (run by
`postinstall`, `dev` and `build`) copies their images to
`slides/public/images/common/` (gitignored).

## Write

```bash
pnpm install
pnpm run list       # what the numbering picks up, and what it leaves out
pnpm run dev        # the deck, live — http://localhost:3030
pnpm run site       # the workshops site, live — http://localhost:4321
```

**The number at the start of a name is its place**; a name that starts with `_`
is turned off. There is no list to maintain anywhere else.

## Build

```bash
pnpm run build          # everything, into build/
pnpm run build:fast     # without the PDF exports (the slow part)
```

The downloads: `elastic-security-slides.pdf`, `elastic-security-workshops.pdf`,
`elastic-security-participants.zip`, plus a starter ZIP per workshop. The
workshops are guided, so there are no solutions and no online editor.

## Deploy

A Netlify site of its own, built and deployed by
[`deploy-trainings.yml`](../.github/workflows/deploy-trainings.yml) on every push
to `main` that touches this folder or `../elasticsearch-common`.

## Tested against Elasticsearch

Before each deploy, the CI replays **every Dev Tools request** of the workshops
and of the slides against the Elasticsearch of
[`../elasticsearch-common/ci/Dockerfile`](../elasticsearch-common/ci/Dockerfile) —
the one the elasticsearch training uses, so both pin the same version
([`check-console.mjs`](../scripts/check-console.mjs)). What needs Kibana (Fleet,
rules, cases) is done in the UI and not replayed; its requests are marked
`<!-- ci: skip -->`.

```bash
docker build -t training-es ../elasticsearch-common/ci && docker run -d --rm --name training-es -p 9200:9200 training-es
export ES_PASSWORD=training
node ../scripts/check-console.mjs .            # everything
node ../scripts/check-console.mjs . 07_hunt    # one file
```

The lab dataset is the setup of every workshop from the second one, and the
fixture of the chapters that query it: `ci/fixtures/lab-dataset.md`, linked under
each chapter's name.
