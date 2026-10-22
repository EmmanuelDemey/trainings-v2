# Elastic — what the trainings share

Not a training: the material that the Elastic trainings have in common, written once.

| Training | Folder |
|---|---|
| Elasticsearch (3 days) | [`../elasticsearch`](../elasticsearch) |
| Elastic Security for SIEM (3 days) | [`../elastic-security`](../elastic-security) |

```
slides/            the slide fragments, one folder per topic
  stack/           the Elastic Stack: use cases, products, the ELK history
  kibana/          Kibana: what it is, and a tour of its apps
  fleet/           Elastic Agent and Fleet: policies, integrations, deployment, monitoring
  esql/            the anatomy of an ES|QL query
images/            the images those fragments show, as /images/common/…
lab/               the lab: a Docker Compose stack — Elasticsearch, Kibana, Fleet Server
ci/Dockerfile      the Elasticsearch every request of both trainings is replayed against
scripts/sync.mjs   copies images/ into the deck of a training, and lab/ into its workshops
```

## How a training uses it

**Slides.** A chapter imports a fragment with Slidev's `src:`, between its own slides:

```md
---
src: ../../elasticsearch-common/slides/fleet/agent-and-fleet.md
---
```

A fragment starts with a slide (no frontmatter of its own), and never says which
training it is in: the slides around it do.

**Images.** Slidev only serves the deck's own `public/` folder, so the sync copies
`images/` to `<training>/slides/public/images/common/` — **gitignored**. A
training's `pnpm install` (postinstall), `pnpm run dev` and `pnpm run build` run it.

**Lab.** `sync.mjs --lab` copies `lab/` into every workshop of the training, as
`workshops/<workshop>/lab/` — gitignored too: each workshop must stand alone, its
starter ZIP only sees the workshop folder. elastic-security uses it.

**Elasticsearch.** Both trainings' `workshops.ci.mjs` point at `ci/`: one pinned
version, bumped by Dependabot for both. Each training keeps its own fixtures, in
its `ci/fixtures/`.

## Deploying

Each training is its own Netlify site. Its `package.json` scripts reach
`../elasticsearch-common`, so a change here deploys both
([`trainings-to-deploy.mjs`](../scripts/trainings-to-deploy.mjs)).
