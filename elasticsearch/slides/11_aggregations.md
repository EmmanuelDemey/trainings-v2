---
layout: cover
---

# 11 - Aggregations

---

# Learning objectives

By the end of this sequence (**~60 min**, workshop included), you will be able to:

- **Compute** metrics: `avg`, `min`, `max`, `stats`, `cardinality`
- **Group** documents into buckets: `terms`, `date_histogram`, `range`, `filters`
- **Nest** aggregations to compute a metric per group
- **Chain** aggregations with pipelines: `derivative`, `avg_bucket`
- **Explain** what aggregations read: doc values, not `text`

---

# What is an aggregation?

The `GROUP BY` of Elasticsearch — statistics on the documents that match a query:

- **Metric**: a value — an average, a sum, a count of distinct values
- **Bucket**: groups of documents — per genre, per month, per price range
- **Pipeline**: a value computed from other aggregations — a derivative, an average of averages

<br />

- Computed **on the results** of the query, in the same request
- The engine of every Kibana visualization and dashboard

---

# What aggregations read

- Aggregations read **doc values**: a column-oriented copy of each field, on disk
- On by default for every type **except `text`**
- To aggregate a text: aggregate its `keyword` sub-field (`title.keyword`)

<br />

> `"fielddata": true` on a `text` field builds that structure **in heap
> memory**, from the analyzed terms: costly, and the buckets are the terms
> (`new`, `york`), not the values. Avoid it.

---

# The shape of an aggregation

```json
POST /movies/_search
{
  "query": { "range": { "year": { "lt": 1980 } } },
  "aggs": {
    "average_duration": { "avg": { "field": "duration" } }
  }
}
```

- `aggs` (or `aggregations`), next to `query`
- Each aggregation has a **name** you choose (`average_duration`) and a **type** (`avg`)
- Several aggregations side by side in the same `aggs`
- Without `query`: on every document

---

# The response, and `size: 0`

`hits` are rarely needed with aggregations: `"size": 0` skips them — and makes the request cacheable.

<!-- ci: no-compare -->
```json
POST /movies/_search
{
  "size": 0,
  "aggs": {
    "average_duration": { "avg": { "field": "duration" } }
  }
}
```

**Expected result**:

```json
{
  "hits": { "total": { "value": 7, "relation": "eq" }, "hits": [] },
  "aggregations": {
    "average_duration": { "value": 139.71 }
  }
}
```

---

# Metric aggregations

| Type | Returns |
|---|---|
| `avg`, `sum`, `min`, `max` | One value |
| `value_count` | The number of values |
| `stats` | `count`, `min`, `max`, `avg`, `sum` at once |
| `extended_stats` | + variance, standard deviation |
| `cardinality` | The number of **distinct** values — approximate |
| `percentiles` | The 50th, 95th, 99th percentiles… — approximate |
| `top_hits` | The best documents of each bucket |

> A metric is always a **leaf** of the tree: it holds no sub-aggregation.

---

# `stats` and `cardinality`

```json
POST /movies/_search
{
  "size": 0,
  "aggs": {
    "duration_stats": { "stats": { "field": "duration" } },
    "distinct_genres": { "cardinality": { "field": "genre" } }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "duration_stats": { "count": 7, "min": 99, "max": 195, "sum": 978 },
    "distinct_genres": { "value": 6 }
  }
}
```

- `cardinality` is exact up to `precision_threshold` (default 3,000), then an estimate (HyperLogLog++)

---

# Bucket aggregations

Each bucket is a group of documents, with its `doc_count`:

| Type | Buckets |
|---|---|
| `terms` | One per value of a field |
| `date_histogram` | One per interval of time |
| `histogram` | One per numeric interval |
| `range`, `date_range` | One per range you define |
| `filters` | One per query you define |
| `geo_distance`, `geotile_grid` | Rings around a point, map tiles |

> Each bucket can hold **sub-aggregations**: that is what makes them powerful.

---

# `terms`

One bucket per value, the most frequent first:

```json
POST /movies/_search
{
  "size": 0,
  "aggs": {
    "genres": { "terms": { "field": "genre", "size": 3 } }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "genres": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 3,
      "buckets": [
        { "key": "science fiction", "doc_count": 2 },
        { "key": "action", "doc_count": 1 },
        { "key": "drama", "doc_count": 1 }
      ]
    }
  }
}
```

---

# `terms`: approximate counts

- Only the **10** most frequent terms by default: `"size"` for more
- `sum_other_doc_count`: the documents of the terms not returned
- Each shard sends its own top terms: on several shards, the counts can be **approximate**
- `doc_count_error_upper_bound`: the maximum error
- `"order": { "_key": "asc" }`, or on a sub-aggregation: `{ "avg_rating": "desc" }`

<br />

> To list **every** value (an export, a full facet), page through them with
> the `composite` aggregation and its `after` key.

---

# `date_histogram`

One bucket per interval of time — the X axis of a Kibana chart:

```json
POST /sales/_search
{
  "size": 0,
  "aggs": {
    "sales_over_time": {
      "date_histogram": { "field": "date", "calendar_interval": "month", "format": "yyyy-MM" }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "sales_over_time": {
      "buckets": [
        { "key_as_string": "2025-01", "doc_count": 3 },
        { "key_as_string": "2025-02", "doc_count": 1 },
        { "key_as_string": "2025-03", "doc_count": 1 }
      ]
    }
  }
}
```

- `calendar_interval`: `day`, `week`, `month`… (variable lengths) · `fixed_interval`: `30m`, `12h`
- `time_zone`, `min_doc_count`, `extended_bounds`: empty buckets, local days

---

# `range`

Buckets you define — price ranges, age groups:

```json
POST /movies/_search
{
  "size": 0,
  "aggs": {
    "durations": {
      "range": {
        "field": "duration",
        "ranges": [ { "to": 120 }, { "from": 120, "to": 160 }, { "from": 160 } ]
      }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "durations": {
      "buckets": [
        { "key": "*-120.0", "doc_count": 2 },
        { "key": "120.0-160.0", "doc_count": 3 },
        { "key": "160.0-*", "doc_count": 2 }
      ]
    }
  }
}
```

- `from` included, `to` excluded · `"key": "short"` to name a range

---

# `filters`

One bucket per query:

```json
POST /logs/_search
{
  "size": 0,
  "aggs": {
    "messages": {
      "filters": {
        "filters": {
          "errors":   { "match": { "body": "error" } },
          "warnings": { "match": { "body": "warning" } }
        }
      }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "messages": {
      "buckets": { "errors": { "doc_count": 1 }, "warnings": { "doc_count": 2 } }
    }
  }
}
```

---

# `geo_distance`

Rings around a point — here, around Amsterdam:

```json
POST /museums/_search
{
  "size": 0,
  "aggs": {
    "rings_around_amsterdam": {
      "geo_distance": {
        "field": "location",
        "origin": "52.3760, 4.894",
        "unit": "km",
        "ranges": [ { "to": 100 }, { "from": 100, "to": 300 }, { "from": 300 } ]
      }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "rings_around_amsterdam": {
      "buckets": [
        { "key": "*-100.0", "doc_count": 3 },
        { "key": "100.0-300.0", "doc_count": 0 },
        { "key": "300.0-*", "doc_count": 1 }
      ]
    }
  }
}
```

---

# Nesting aggregations

A metric **per bucket** — the average duration per genre, longest first:

```json
POST /movies/_search
{
  "size": 0,
  "aggs": {
    "genres": {
      "terms": { "field": "genre", "order": { "avg_duration": "desc" } },
      "aggs": {
        "avg_duration": { "avg": { "field": "duration" } }
      }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "genres": {
      "buckets": [ { "key": "drama", "doc_count": 1, "avg_duration": { "value": 195.0 } } ]
    }
  }
}
```

- Buckets nest too: genres, then years inside each genre
- Every level multiplies the buckets: watch the `size` of each `terms`

---

# Aggregations and queries

The aggregations work on the documents the **query** selects:

```json
POST /movies/_search
{
  "size": 0,
  "query": { "range": { "year": { "gte": 1977, "lt": 1980 } } },
  "aggs": {
    "genres": { "terms": { "field": "genre" } },
    "all_movies": {
      "global": {},
      "aggs": { "genres": { "terms": { "field": "genre" } } }
    }
  }
}
```

- `global`: escapes the query — every document of the index
- `filter`: one bucket with a sub-selection — `{ "filter": { "term": { "genre": "drama" } } }`
- `post_filter`: filters the **hits**, not the aggregations — faceted search

---

# Pipeline aggregations

They read the **output of other aggregations**, not the documents:

- **Parent**: inside a multi-bucket aggregation, adds a value to **each bucket**
  — `derivative`, `cumulative_sum`, `moving_fn`, `bucket_script`
- **Sibling**: next to it, computes **one value** from all its buckets
  — `avg_bucket`, `max_bucket`, `sum_bucket`, `stats_bucket`

<br />

`buckets_path` names the aggregation to read:

- `"sales"` — a sibling metric in the same bucket
- `"sales_per_month>sales"` — the `sales` metric of each bucket of `sales_per_month`

---

# Pipeline: parent — `derivative`

The month-to-month change of the sales:

```json
POST /sales/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": { "field": "date", "calendar_interval": "month", "format": "yyyy-MM" },
      "aggs": {
        "sales": { "sum": { "field": "price" } },
        "sales_deriv": { "derivative": { "buckets_path": "sales" } }
      }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "sales_per_month": {
      "buckets": [
        { "key_as_string": "2025-01", "sales": { "value": 550.0 } },
        { "key_as_string": "2025-02", "sales": { "value": 60.0 }, "sales_deriv": { "value": -490.0 } },
        { "key_as_string": "2025-03", "sales": { "value": 375.0 }, "sales_deriv": { "value": 315.0 } }
      ]
    }
  }
}
```

---

# Pipeline: sibling — `avg_bucket`

The average of the monthly sales — `avg_bucket` sits **next to** `sales_per_month`:

<!-- ci: no-compare -->
```json
POST /sales/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": { "field": "date", "calendar_interval": "month" },
      "aggs": { "sales": { "sum": { "field": "price" } } }
    },
    "avg_monthly_sales": {
      "avg_bucket": { "buckets_path": "sales_per_month>sales" }
    }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "sales_per_month": { "buckets": [ "…" ] },
    "avg_monthly_sales": { "value": 328.33 }
  }
}
```

---

# Quiz

**`{ "terms": { "field": "title" } }` fails on a `text` field. What is the fix?**

- A) Set `"fielddata": true` on `title`
- B) Aggregate the `title.keyword` sub-field
- C) Add `"size": 0` to the request
- D) Use a `match` query first

<v-click>

**Answer: B** — a `keyword` has doc values, and its buckets are the whole titles. `fielddata` would load the analyzed terms in heap memory.

</v-click>

---

# Quiz

**What is the difference between a metric and a bucket aggregation?**

- A) A metric computes a value; a bucket groups documents and can hold sub-aggregations
- B) A bucket is faster
- C) A metric only works on dates
- D) There is none

<v-click>

**Answer: A** — buckets build the groups, metrics are the leaves that measure them.

</v-click>

---
layout: cover
---

# Workshop 6

## Aggregations
