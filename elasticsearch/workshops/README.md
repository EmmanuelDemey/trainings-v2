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
- a terminal, for the workshops that touch the node configuration (workshops 14,
  15, 17 and 18) and for the `curl` calls.

One node is enough (`yellow` status accepted). Workshop 12 is done in code
(Node.js, or the language of your choice) and needs **Docker** for
Testcontainers.

Each workshop **stands on its own**: it creates the indices and data it needs, and
can be done without the previous ones.

The CI replays every workshop on the latest Elasticsearch (9.5.6), with the
trainer's solutions: each expected result is the one a correct answer gets.

## The workshops

| Day | Workshop | Chapter | Folder | Topic |
|-----|----------|---------|--------|-------|
| 1 | 1 | 3 | `01_cat_apis/` | Inspect the cluster with the `_cat` APIs |
| 1 | 2 | 4 | `02_indexing_search/` | Create an index, index documents, `match` and `bool` |
| 1 | 3 | 4 | `03_documents_bulk/` | Document CRUD, `_bulk` |
| 1 | 4 | 7 | `04_mapping_analyzers/` | Explicit mapping, `text` vs `keyword`, analyzers, aliases, index templates |
| 2 | 5 | 10 | `05_search/` | Lucene, Query DSL: full text, exact, geo, boolean |
| 2 | 6 | 11 | `06_aggregations/` | Metrics, bucket and pipeline aggregations |
| 2 | 7 | 12 | `07_esql/` | ES\|QL: filter, aggregate, `LOOKUP JOIN`, full text |
| 2 | 8 | 13 | `08_vector_search/` | kNN, hybrid search with retrievers, `semantic_text` |
| 2 | 9 | 14 | `09_ingest/` | Ingest pipelines: `grok`, `date`, conditions, `on_failure`, default pipeline |
| 2 | 10 | 15 | `10_transforms_pivot/` | Transforms: pivot an index into an entity-centric one |
| 2 | 11 | 15 | `11_transforms_continuous/` | Continuous transforms, `latest`, checkpoints |
| 3 | 12 | 16 | `12_sdk/` | Official client, tests with Testcontainers |
| 3 | 13 | 17 | `13_security/` | Users and roles (RBAC), Document-Level Security |
| 3 | 14 | 18 | `14_snapshots/` | Repositories, snapshots and restores |
| 3 | 15 | 19 | `15_ilm_retention/` | Hot-warm-cold architecture and ILM policies |
| 3 | 16 | 20 | `16_data_streams/` | LogsDB, data stream lifecycle, failure store, TSDS |
| 3 | 17 | 21 | `17_sizing_performance/` | Shard count, JVM heap, thread pools |
| 3 | 18 | 22 | `18_production_architecture/` | Allocation awareness, SLM, Field-Level Security |
| 3 | 19 | 23 | `19_monitoring/` | Cluster health, node statistics, slow logs |
| 3 | 20 | 24 | `20_alerting/` | Kibana Rules, webhooks, alert history |
