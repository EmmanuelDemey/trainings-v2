---
layout: cover
---

# 7 - Aggregations

---

# Learning objectives

By the end of this sequence (**~30 min**, workshop included), you will be able to:

- **Compute** metrics: average, min, max, cardinality, percentiles
- **Group** documents into buckets: `terms`, `range`, `date_histogram`
- **Nest** aggregations, and **combine** them with a search
- **Place** pipeline aggregations

---

# The shape of an aggregation

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "avg_price": { "avg": { "field": "price" } }
  }
}
```

**Expected result**:

```json
{ "aggregations": { "avg_price": { "value": 34.0 } } }
```

- `size: 0`: we want **only** the aggregation, not the documents
- Aggregations run over the documents that match the `query`
- On a `keyword`, numeric or date field — **not** on a `text` one

---

# The three families

| Family | Produces | Examples |
|---|---|---|
| **Metrics** | One or more **values** | `avg`, `sum`, `min`, `max`, `stats`, `cardinality`, `percentiles`, `top_hits` |
| **Bucket** | **Groups** of documents | `terms`, `range`, `histogram`, `date_histogram`, `filters`, `geohash_grid` |
| **Pipeline** | A computation over **other aggregations** | `avg_bucket`, `max_bucket`, `derivative`, `cumulative_sum`, `bucket_sort` |

<br />

> A bucket aggregation can hold **sub-aggregations**: they run
> in **each** bucket.

---

# Buckets: `terms`

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "by_city": { "terms": { "field": "city", "size": 10 } }
  }
}
```

**Expected result**:

```json
{
  "aggregations": {
    "by_city": {
      "buckets": [
        { "key": "Paris", "doc_count": 5 },
        { "key": "Lyon", "doc_count": 4 },
        { "key": "Marseille", "doc_count": 3 }
      ]
    }
  }
}
```

- Sorted by descending `doc_count`; `size`: the top N
- Over several shards, `terms` is **approximate**: `shard_size` improves accuracy

---

# Sub-aggregations

The average rating and the max price, **per city**:

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "by_city": {
      "terms": { "field": "city" },
      "aggs": {
        "avg_rating": { "avg": { "field": "rating" } },
        "max_price":  { "max": { "field": "price" } }
      }
    }
  }
}
```

- Sort the buckets by a sub-aggregation: `"order": { "avg_rating": "desc" }`
- Any depth, but each level **multiplies** the number of buckets

---

# Buckets: `range` and `date_histogram`

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [ { "key": "budget", "to": 20 }, { "key": "mid-range", "from": 20, "to": 50 }, { "key": "high-end", "from": 50 } ]
      }
    },
    "openings": {
      "date_histogram": { "field": "opened", "calendar_interval": "year", "format": "yyyy", "min_doc_count": 1 }
    }
  }
}
```

- `date_histogram`: the basis of every **time series chart** in Dashboards
- `calendar_interval` (`day`, `month`, `year`) or `fixed_interval` (`30m`, `12h`)

---

# Aggregation + search

The `query` narrows the aggregated documents:

```json
GET /restaurants/_search
{
  "size": 0,
  "query": { "range": { "rating": { "gte": 4 } } },
  "aggs": {
    "cuisines": { "terms": { "field": "cuisine" } },
    "price_stats": { "stats": { "field": "price" } }
  }
}
```

- `post_filter`: filters the **hits** **without** touching the aggregations — for
  facets that stay visible after a click
- `global`: an aggregation that ignores the `query`

---

# Pipeline aggregations

They compute over the **result** of other aggregations, through `buckets_path`:

```json
GET /restaurants/_search
{
  "size": 0,
  "aggs": {
    "by_city": {
      "terms": { "field": "city" },
      "aggs": { "avg_price": { "avg": { "field": "price" } } }
    },
    "most_expensive_city": {
      "max_bucket": { "buckets_path": "by_city>avg_price" }
    }
  }
}
```

**Expected result**:

```json
{ "aggregations": { "most_expensive_city": { "keys": ["Paris"] } } }
```

---

# Quiz

**Why does a `terms` aggregation on `name` (type `text`) fail?**

<v-clicks>

- A) `terms` only works on numbers
- B) A `text` field has no doc values: aggregate on `name.keyword` instead ✅
- C) It needs `size: 0`
- D) It needs a `query`

**Answer: B** — we aggregate on the exact value, stored in columns (doc values).

</v-clicks>

---
layout: cover
---

# Workshop 5

## Aggregations
