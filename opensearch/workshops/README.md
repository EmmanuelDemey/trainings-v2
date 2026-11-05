# OpenSearch — Workshops

The exercises of the **OpenSearch** training. Each workshop gives you the data and a
goal per step, **not the request**: you find it in the documentation, you try it,
you read the response, you adjust. The expected result lets you check your answer;
a folded hint helps if you are stuck — try without it first.

## What you need

- **Docker** (Docker Desktop or Docker Engine + Compose), 4 GB of free RAM;
- a browser;
- a terminal, to start the lab and for a few `curl` calls.

The lab is in `01_installation/docker-compose.yml`: one **OpenSearch** node and
**OpenSearch Dashboards**, with the security plugin disabled. The requests are pasted
as is into **Dev Tools** (☰ menu → Management → Dev Tools).

Each workshop is **self-contained**: it creates the indices and the data it needs, and
can be done without the previous ones.

The CI replays each workshop on OpenSearch 3.9.0, with the trainer's solutions:
every expected result is the one a correct answer gets.

## The workshops

| When | Workshop | Folder | Topic |
|-----|----|---------|-------|
| Morning | 1 | `01_installation/` | Start the lab, cluster health, `_cat`, replicas |
| Morning | 2 | `02_indexing_mapping/` | Dynamic vs explicit mapping, `_bulk`, `_reindex`, aliases |
| Morning | 3 | `03_search/` | `match`, `term`, `bool`, `boost`, `function_score` |
| Afternoon | 4 | `04_analysis/` | `_analyze`, custom analyzer, synonyms |
| Afternoon | 5 | `05_aggregations/` | Metrics, buckets, sub-aggregations, pipeline |
| Afternoon | 6 | `06_advanced_search/` | Sorting, `search_after`, highlighting, completion, geo, percolation |
| Afternoon | 7 | `07_ingest/` | `_simulate`, `csv`, `date`, conditions, `on_failure`, default pipeline |
| Afternoon | 8 | `08_dashboards/` | Index pattern, Discover, visualizations, map, dashboard |

Each workshop ends with **"Going further"**: something to keep going after the
session, what the day leaves no time for.
