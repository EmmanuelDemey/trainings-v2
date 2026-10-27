# Elasticsearch — Workshops

The hands-on exercises of the **Elasticsearch** training. Each workshop gives you
the data and a goal per step, **not the request**: you find it in the
documentation, try it, read the response, and adjust. The expected result lets you
check your own answer; a folded hint helps when you are stuck — try without it
first.

## What you need

- a reachable **Elasticsearch** cluster (`GET /` must answer);
- **Kibana**, to send the requests from **Dev Tools** (Console) — the setup blocks
  `GET /…`, `PUT /…`, `POST /…` paste there as is;
- a terminal, for the workshops that touch the node configuration (workshops 8,
  9, 13 and 16) and for the `curl` calls.

One node is enough (`yellow` status accepted). Workshop 12 is done in code
(Node.js, or the language of your choice) and needs **Docker** for
Testcontainers.

Each workshop **stands on its own**: it creates the indices and data it needs, and
can be done without the previous ones.

The CI replays every workshop on the latest Elasticsearch (9.5.5), with the
trainer's solutions: each expected result is the one a correct answer gets.

## The workshops

| Day | Workshop | Folder | Topic |
|-----|----------|--------|-------|
| 1 | 1 | `01_indexing_search/` | Create an index, index documents, `match` and `bool` |
| 1 | 2 | `02_documents_bulk/` | Document CRUD, `_bulk` |
| 1 | 3 | `03_mapping_analyzers/` | Explicit mapping, `text` vs `keyword`, analyzers, aliases, index templates |
| 2 | 4 | `04_search/` | Lucene, Query DSL: full text, exact, geo, boolean |
| 2 | 5 | `05_aggregations/` | Metrics, bucket and pipeline aggregations |
| 2 | 6 | `06_ingest/` | Ingest pipelines: `grok`, `date`, conditions, `on_failure`, default pipeline |
| 2 | 7 | `07_security/` | Users and roles (RBAC), Document-Level Security |
| 2 | 8 | `08_snapshots/` | Repositories, snapshots and restores |
| 2 | 9 | `09_ilm_retention/` | Hot-warm-cold architecture and ILM policies |
| 3 | 10 | `10_cat_apis/` | Inspect the cluster with the `_cat` APIs |
| 3 | 11 | `11_esql/` | ES\|QL: filter, aggregate, `LOOKUP JOIN`, full text |
| 3 | 12 | `12_sdk/` | Official client, tests with Testcontainers |
| 3 | 13 | `13_sizing_performance/` | Shard count, JVM heap, thread pools |
| 3 | 14 | `14_alerting/` | Kibana Rules, webhooks, alert history |
| 3 | 15 | `15_monitoring/` | Cluster health, node statistics, slow logs |
| 3 | 16 | `16_production_architecture/` | Allocation awareness, SLM, Field-Level Security |
