# OpenSearch — training review TODO (1 day)

Current state: 12 chapters (00 → 11), 8 workshops, based on **OpenSearch 3.9.0**
(`ci/Dockerfile`, `workshops/01_installation/docker-compose.yml`).

3 todos per working day starting Friday 6 November 2026 (Wednesday 11
November, a public holiday, skipped). Each workshop is reviewed right after the chapter that introduces it.

## OpenSearch — Friday 6 November — Run OpenSearch locally

- [ ] Find / document how to run OpenSearch locally to review and
      replay the workshops. Options:
      - the learners' lab: `docker compose up -d` in
        `workshops/01_installation/` (OpenSearch :9200 + Dashboards :5601)
      - the CI image: `docker build -t training-os ci && docker run -d --rm --name training-os -p 9200:9200 training-os`
- [ ] Check `curl http://localhost:9200` and access to http://localhost:5601
- [ ] Check the machine prerequisites (Docker, RAM, `vm.max_map_count` on Linux)

## OpenSearch — Monday 9 November

- [ ] Replay the requests: `node ../scripts/check-console.mjs .`
- [ ] Chapter 00 — Agenda (`slides/00_intro.md`)
- [ ] Chapter 01 — OpenSearch (`slides/01_opensearch.md`)

## OpenSearch — Tuesday 10 November

- [ ] Chapter 02 — Architecture and concepts (`slides/02_architecture.md`)
- [ ] Chapter 03 — Installation and REST API (`slides/03_installation.md`)
- [ ] Workshop 1 — Installation and first steps (`workshops/01_installation`, `solutions/01_installation`)

## OpenSearch — Thursday 12 November

- [ ] Chapter 04 — Indexing and mapping (`slides/04_indexing_mapping.md`)
- [ ] Workshop 2 — Indexing and mapping (`workshops/02_indexing_mapping`, `solutions/02_indexing_mapping`)
- [ ] Chapter 05 — Search and relevance (`slides/05_search_relevance.md`)

## OpenSearch — Friday 13 November

- [ ] Workshop 3 — Search and relevance (`workshops/03_search`, `solutions/03_search`)
- [ ] Chapter 06 — Text analysis (`slides/06_analysis.md`)
- [ ] Workshop 4 — Text analysis (`workshops/04_analysis`, `solutions/04_analysis`)

## OpenSearch — Monday 16 November

- [ ] Chapter 07 — Aggregations (`slides/07_aggregations.md`)
- [ ] Workshop 5 — Aggregations (`workshops/05_aggregations`, `solutions/05_aggregations`)
- [ ] Chapter 08 — Advanced search features (`slides/08_advanced_search.md`)

## OpenSearch — Tuesday 17 November

- [ ] Workshop 6 — Advanced search (`workshops/06_advanced_search`, `solutions/06_advanced_search`)
- [ ] Chapter 09 — Ingest pipelines (`slides/09_ingest.md`)
- [ ] Workshop 7 — Ingest pipelines (`workshops/07_ingest`, `solutions/07_ingest`)

## OpenSearch — Wednesday 18 November

- [ ] Chapter 10 — OpenSearch Dashboards (`slides/10_dashboards.md`)
- [ ] Workshop 8 — OpenSearch Dashboards (`workshops/08_dashboards`, `solutions/08_dashboards`)
- [ ] Chapter 11 — Conclusion (`slides/11_conclusion.md` + `slides/shared/retro.md`)
