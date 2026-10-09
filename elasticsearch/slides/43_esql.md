---
layout: cover
---

# ES|QL

---

# ES|QL — Elasticsearch Query Language

* A **piped** query language: each command transforms the table produced by the previous one
* Its own **compute engine**, columnar and parallel — not translated into Query DSL like SQL is
* Available everywhere:
    * the `_query` API
    * **Discover** (ES|QL mode), Lens, dashboards
    * **Kibana alerting** rules (ES|QL rule type)
* GA since 8.14 — the language Elastic adds new features to first

```
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | WHERE status >= 400
    | KEEP @timestamp, url, status
    | SORT @timestamp DESC
  """
}
```

---

# Anatomy of a query

* A **source command**: `FROM` (indices, aliases, data streams), `ROW`, `SHOW`, `TS` (time series)
* Then **processing commands**, separated by `|`

| Command | Role |
|---------|------|
| `WHERE` | Filter rows |
| `EVAL` | Compute new columns |
| `KEEP` / `DROP` / `RENAME` | Choose the columns |
| `STATS … BY` | Aggregate |
| `SORT` / `LIMIT` | Order and cut |
| `DISSECT` / `GROK` | Parse a string into columns |
| `ENRICH` / `LOOKUP JOIN` | Add columns from another index |

* Without `LIMIT`, a query returns **1000 rows** at most

---

# Formats

* `format=txt`, `csv`, `tsv`: for a human, or a spreadsheet
* `format=json` (default): `columns` + `values`, row by row

```
POST /_query?format=json
{
  "query": "FROM web-logs | KEEP url, status | LIMIT 2"
}
```

```json
{
  "columns": [ { "name": "url", "type": "keyword" }, { "name": "status", "type": "integer" } ],
  "values": [ [ "/home", 200 ], [ "/cart", 500 ] ]
}
```

---

# EVAL and functions

```
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | EVAL kb = bytes / 1024.0,
           family = CASE(status >= 500, "server error",
                         status >= 400, "client error",
                         "ok")
    | KEEP url, kb, family
  """
}
```

* Hundreds of functions: strings (`CONCAT`, `TO_LOWER`…), dates (`DATE_TRUNC`, `DATE_DIFF`…), math, IP (`CIDR_MATCH`), geo, conversions (`TO_INTEGER`…)

---

# STATS … BY

```
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | STATS requests = COUNT(*), avg_bytes = AVG(bytes)
            BY hour = BUCKET(@timestamp, 1 hour)
    | SORT hour
  """
}
```

```text
   requests    |   avg_bytes   |          hour
---------------+---------------+------------------------
2              |750.0          |2026-10-01T10:00:00.000Z
2              |750.0          |2026-10-01T11:00:00.000Z
```

* `INLINE STATS` keeps every row, and adds the aggregate next to it

```
POST /_query?format=txt
{
  "query": "FROM web-logs | INLINE STATS max_bytes = MAX(bytes) BY host | KEEP host, url, bytes, max_bytes"
}
```

---

# Parameters

* Never concatenate user input into a query: pass **parameters**

```
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | WHERE url == ?path AND status >= ?min_status
    | KEEP @timestamp, status
  """,
  "params": [ { "path": "/home" }, { "min_status": 200 } ]
}
```

---

# Full-text search in ES|QL

* `MATCH`, `QSTR` (query string) and the `:` operator use the inverted index, like the Query DSL
* `METADATA _score` exposes the relevance score

```
POST /_query?format=txt
{
  "query": """
    FROM web-logs METADATA _score
    | WHERE MATCH(message, "failed timeout")
    | SORT _score DESC
    | KEEP url, message, _score
  """
}
```

---

# LOOKUP JOIN

* Joins every row with the matching document of a **lookup index** (`index.mode: lookup`: one shard, replicated on every node)

```
PUT /currencies
{
  "settings": { "index.mode": "lookup" },
  "mappings": { "properties": { "code": { "type": "keyword" } } }
}
```

```
POST /_query?format=txt
{
  "query": """
    FROM web-logs
    | WHERE status >= 400
    | LOOKUP JOIN countries ON country_code
    | STATS errors = COUNT(*) BY country_name
  """
}
```

* Simpler than `ENRICH` (no enrich policy to create and execute): the lookup index is updated like any index

---

# Async queries

* A long query runs in the background: `wait_for_completion_timeout`, then poll with its `id`

```
POST /_query/async?format=json
{
  "query": "FROM web-logs | STATS c = COUNT(*)",
  "wait_for_completion_timeout": "2s"
}
```

<!-- ci: skip -->
```
GET /_query/async/<id>
```

---

# ES|QL, SQL or Query DSL?

| | Query DSL | SQL | ES\|QL |
|---|---|---|---|
| Shape | JSON | SQL | Pipes |
| Engine | Search | Translated into Query DSL | Its own, columnar |
| Joins | No | No | `LOOKUP JOIN` |
| Computed columns | Runtime fields, scripts | Yes | `EVAL` |
| Kibana | Everywhere | Little | Discover, Lens, alerting |
| Pagination | `search_after`, PIT | Cursor | No: `LIMIT` (10 000 max) |

* **Query DSL**: the application's search (relevance, pagination, highlighting)
* **ES|QL**: exploration, investigation, reporting, alerting
* **SQL**: the JDBC/ODBC tools that already speak it
