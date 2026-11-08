---
layout: cover
---

# 12 - ES|QL

---

# Learning objectives

By the end of this sequence (**~60 min**, workshop included), you will be able to:

- **Write** an ES|QL query that reads from top to bottom: `FROM`, `WHERE`, `KEEP`, `SORT`, `LIMIT`
- **Compute** columns with `EVAL`, and **aggregate** with `STATS … BY`
- **Translate** an aggregation of the Query DSL into `STATS`
- **Join** a lookup index with `LOOKUP JOIN`, and **search** full text with `MATCH`
- **Choose** between the Query DSL, ES|QL and SQL

---

# A piped query language

```json
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

- Each command transforms the **table** produced by the previous one
- Its own **compute engine**, columnar and parallel — not translated into Query DSL, as SQL is
- Everywhere: the `_query` API, **Discover** (ES|QL mode), Lens, dashboards, **alerting** rules
- GA since 8.14 — the language Elastic adds new features to first

---
src: ../../elasticsearch-common/slides/esql/anatomy.md
---

---

# Output formats

```json
POST /_query?format=json
{
  "query": "FROM web-logs | SORT @timestamp | KEEP url, status | LIMIT 2"
}
```

**Expected result**:

```json
{
  "columns": [ { "name": "url", "type": "keyword" }, { "name": "status", "type": "integer" } ],
  "values": [ [ "/home", 200 ], [ "/cart", 500 ] ]
}
```

- `format=json` (default): `columns` + `values`, row by row — for an application
- `format=txt`, `csv`, `tsv`: for a human, or a spreadsheet

---

# `EVAL`: computed columns

```json
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

- Hundreds of functions: strings (`CONCAT`, `TO_LOWER`…), dates (`DATE_TRUNC`, `DATE_DIFF`…),
  math, IP (`CIDR_MATCH`), geo, conversions (`TO_INTEGER`…)

---

# `STATS … BY`: aggregate

```json
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

- One row per group: the aggregates first, then the `BY` columns

---

# The same question, as an aggregation

*Average size of the responses, per host*, with the Query DSL:

```json
POST /web-logs/_search
{
  "size": 0,
  "aggs": {
    "by_host": {
      "terms": { "field": "host" },
      "aggs": { "avg_bytes": { "avg": { "field": "bytes" } } }
    }
  }
}
```

- The answer is a **tree** of buckets, each holding its sub-aggregations

---

# … and as ES|QL

```json
POST /_query?format=json
{
  "query": "FROM web-logs | STATS avg_bytes = AVG(bytes) BY host | SORT host"
}
```

**Expected result**:

```json
{
  "values": [ [ 600.0, "web-1" ], [ 900.0, "web-2" ] ]
}
```

- The answer is a **flat table**: one row per group
- The application that renders facets keeps the aggregations; the analyst exploring the data writes `STATS`

---

# From aggregations to `STATS`

| Aggregation | ES\|QL |
|---|---|
| `terms` | `BY field` |
| `date_histogram` | `BY BUCKET(@timestamp, 1 hour)` |
| `avg`, `sum`, `min`, `max`, `value_count` | `AVG()`, `SUM()`, `MIN()`, `MAX()`, `COUNT()` |
| `cardinality` | `COUNT_DISTINCT()` (approximate too) |
| `percentiles` | `PERCENTILE(field, 95)` |
| sub-aggregation | several `BY` columns |
| `bucket_selector` (keep some buckets) | `WHERE` after `STATS` |
| `bucket_sort`, `size` | `SORT`, `LIMIT` |
| sibling pipeline (`avg_bucket`…) | a second `STATS` on the result |

---

# `INLINE STATS`: keep the rows

```json
POST /_query?format=txt
{
  "query": "FROM web-logs | INLINE STATS max_bytes = MAX(bytes) BY host | KEEP host, url, bytes, max_bytes"
}
```

- Every row is kept, the aggregate of its group is **added** next to it
- Typical: compare a value with the maximum, or the average, of its group

> Tech preview in some 9.x versions: check its status for yours.

---

# Parameters, not concatenation

```json
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

> Never concatenate user input into a query: an injection is as easy as in SQL.

---

# Full-text search in ES|QL

```json
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

- `MATCH`, `QSTR` (query string) and the `:` operator use the **inverted index**, as the Query DSL does
- `METADATA _score` exposes the relevance score — sort on it

---

# A lookup index

Every row can be joined with the matching document of a **lookup index**:

<!-- ci: skip -->
```json
PUT /countries
{
  "settings": { "index.mode": "lookup" },
  "mappings": {
    "properties": {
      "country_code": { "type": "keyword" },
      "country_name": { "type": "keyword" }
    }
  }
}
```

- `index.mode: lookup`: a single shard, replicated on every node holding data
- Updated like any index: no policy to execute, as with `ENRICH`

---

# `LOOKUP JOIN`

```json
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

- A **left join**: a row with no match is kept, its lookup columns are `null`
- The join key must have the same name on both sides — `RENAME` it first if needed

---

# Async queries

A long query runs in the background: wait a little, then poll with its `id`.

```json
POST /_query/async?format=json
{
  "query": "FROM web-logs | STATS c = COUNT(*)",
  "wait_for_completion_timeout": "2s"
}
```

<!-- ci: skip -->
```json
GET /_query/async/<id>
```

- Done within the timeout: the response holds the result; otherwise, an `id` and `is_running: true`

---

# Query DSL, ES|QL or SQL?

| | Query DSL | SQL | ES\|QL |
|---|---|---|---|
| Shape | JSON | SQL | Pipes |
| Engine | Search | Translated into Query DSL | Its own, columnar |
| Joins | No | No | `LOOKUP JOIN` |
| Computed columns | Runtime fields, scripts | Yes | `EVAL` |
| Kibana | Everywhere | Little | Discover, Lens, alerting |
| Pagination | `search_after`, PIT | Cursor | No: `LIMIT` (10 000 max) |

- **Query DSL**: the application's search — relevance, pagination, highlighting
- **ES|QL**: exploration, investigation, reporting, alerting
- **SQL**: the JDBC/ODBC tools that already speak it

---

# Quiz

**`FROM web-logs | WHERE status >= 400` returns 1000 rows, though the index holds 50 000 errors. Why?**

- A) The query timed out
- B) Without `LIMIT`, a query returns 1000 rows at most
- C) ES|QL samples the data
- D) The index has more than one shard

<v-click>

**Answer: B** — add an explicit `LIMIT` (10 000 at most), or aggregate with `STATS` instead of reading the rows.

</v-click>

---
layout: cover
---

# Workshop 7

## ES|QL: exploring logs with pipes
